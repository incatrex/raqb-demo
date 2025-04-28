#!/usr/bin/env python3
import json
import sys
from typing import Dict, List, Union, Any, Optional

# Type definitions for clarity
QueryNode = Dict[str, Any]
GroupNode = Dict[str, Any]
RuleNode = Dict[str, Any]
JSONValue = Union[str, int, float, bool, None, Dict[str, Any], List[Any]]


class SQLGenerator:
    """Generates SQL expressions from react-awesome-query-builder JSON trees."""

    # Mapping of query builder operators to SQL operators
    OPERATOR_MAPPING = {
        "equal": "=",
        "not_equal": "!=",
        "less": "<",
        "less_or_equal": "<=",
        "greater": ">",
        "greater_or_equal": ">=",
        "like": "LIKE",
        "not_like": "NOT LIKE",
        "starts_with": "LIKE",  # Will need special handling
        "ends_with": "LIKE",  # Will need special handling
        "between": "BETWEEN",
        "not_between": "NOT BETWEEN",
        "is_null": "IS NULL",
        "is_not_null": "IS NOT NULL",
        "is_empty": "= ''",
        "is_not_empty": "!= ''",
        "in": "IN",
        "not_in": "NOT IN",
        # For groups
        "AND": "AND",
        "OR": "OR"
    }

    def __init__(self, use_params: bool = False):
        """
        Initialize the SQL generator.
        
        Args:
            use_params: If True, use parameterized queries instead of inlining values
        """
        self.use_params = use_params
        self.params = []
        self.param_index = 0

    def format_value(self, value: JSONValue, value_type: Optional[str] = None) -> str:
        """
        Format a value based on its type for SQL insertion.
        
        Args:
            value: The value to format
            value_type: The type of the value from the query builder
            
        Returns:
            Formatted SQL value
        """
        if value is None:
            return "NULL"
        
        # Handle arrays of values
        if isinstance(value, list):
            if len(value) == 1:
                return self.format_value(value[0], value_type[0] if isinstance(value_type, list) else value_type)
            return "(" + ", ".join(self.format_value(v) for v in value) + ")"
        
        # Get effective value type
        effective_type = value_type
        if isinstance(value_type, list) and len(value_type) == 1:
            effective_type = value_type[0]
            
        # Format based on type
        if effective_type == "string" or isinstance(value, str):
            # Escape single quotes by doubling them
            escaped_value = str(value).replace("'", "''")
            return f"'{escaped_value}'"
        elif effective_type == "number" or isinstance(value, (int, float)):
            return str(value)
        elif effective_type == "boolean" or isinstance(value, bool):
            return "TRUE" if value else "FALSE"
        elif effective_type in ("date", "datetime"):
            return f"DATE '{value}'"
        elif effective_type == "time":
            return f"'{value}'"
        else:
            # Default stringification
            return f"'{str(value).replace('\'', '\'\'')}'"

    def add_param(self, value: JSONValue) -> str:
        """
        Add a parameter for parameterized queries.
        
        Args:
            value: The value to add as a parameter
            
        Returns:
            Parameter placeholder
        """
        self.param_index += 1
        self.params.append(value)
        return f"${self.param_index}"

    def process_rule(self, rule: RuleNode) -> str:
        """
        Process a rule node to generate a SQL condition.
        
        Args:
            rule: The rule node to process
            
        Returns:
            SQL condition string
        """
        props = rule["properties"]
        operator = props["operator"]
        field = props["field"]
        
        # Handle special operators
        if operator in ("is_null", "is_not_null"):
            return f"{field} {self.OPERATOR_MAPPING[operator]}"
            
        if operator in ("is_empty", "is_not_empty"):
            return f"{field} {self.OPERATOR_MAPPING[operator]}"
            
        # Extract value and value type
        value = props["value"]
        value_type = props.get("valueType")
        
        # Handle BETWEEN operator
        if operator in ("between", "not_between") and isinstance(value, list) and len(value) >= 2:
            low_val = self.format_value(value[0], value_type[0] if isinstance(value_type, list) else value_type)
            high_val = self.format_value(value[1], value_type[0] if isinstance(value_type, list) else value_type)
            return f"{field} {self.OPERATOR_MAPPING[operator]} {low_val} AND {high_val}"
            
        # Handle IN operator
        if operator in ("in", "not_in"):
            formatted_values = self.format_value(value, value_type)
            return f"{field} {self.OPERATOR_MAPPING[operator]} {formatted_values}"
            
        # Handle LIKE operators with special patterns
        if operator == "starts_with":
            formatted_value = self.format_value(value[0] if isinstance(value, list) else value, 
                                              value_type[0] if isinstance(value_type, list) else value_type)
            # Remove quotes and add % at the end
            inner_value = formatted_value[1:-1] + "%"
            return f"{field} LIKE '{inner_value}'"
            
        if operator == "ends_with":
            formatted_value = self.format_value(value[0] if isinstance(value, list) else value, 
                                              value_type[0] if isinstance(value_type, list) else value_type)
            # Remove quotes and add % at the beginning
            inner_value = "%" + formatted_value[1:-1]
            return f"{field} LIKE '{inner_value}'"
            
        # Handle regular binary operators
        formatted_value = self.format_value(value[0] if isinstance(value, list) else value, 
                                          value_type[0] if isinstance(value_type, list) else value_type)
        return f"{field} {self.OPERATOR_MAPPING[operator]} {formatted_value}"

    def process_group(self, group: GroupNode) -> str:
        """
        Process a group node to generate a SQL condition.
        
        Args:
            group: The group node to process
            
        Returns:
            SQL condition string
        """
        props = group.get("properties", {})
        conjunction = props.get("conjunction", "AND")
        negate = props.get("not", False)
        
        # Process children
        children = group.get("children1", [])
        if not children:
            return "TRUE"  # Empty group
            
        conditions = []
        for child in children:
            if child["type"] == "rule":
                conditions.append(self.process_rule(child))
            elif child["type"] == "group":
                conditions.append(self.process_group(child))
                
        # Join conditions with the conjunction
        joined_conditions = f" {conjunction} ".join(conditions)
        
        # Add parentheses for compound conditions
        if len(conditions) > 1:
            joined_conditions = f"({joined_conditions})"
            
        # Apply negation if necessary
        if negate:
            joined_conditions = f"NOT {joined_conditions}"
            
        return joined_conditions

    def generate_sql(self, query_tree: Dict[str, Any]) -> str:
        """
        Generate a SQL WHERE clause from a query tree.
        
        Args:
            query_tree: The query tree JSON
            
        Returns:
            SQL WHERE clause
        """
        # Reset params for each query
        self.params = []
        self.param_index = 0
        
        if query_tree["type"] == "group":
            return self.process_group(query_tree)
        elif query_tree["type"] == "rule":
            return self.process_rule(query_tree)
        else:
            raise ValueError(f"Unknown node type: {query_tree['type']}")


def main():
    """Main function to parse JSON from file and generate SQL."""
    if len(sys.argv) < 2:
        print("Usage: python sql_generator.py <query_json_file>")
        sys.exit(1)
        
    # Read JSON from file
    with open(sys.argv[1], 'r') as f:
        query_tree = json.load(f)
        
    # Generate SQL
    generator = SQLGenerator()
    try:
        sql_where = generator.generate_sql(query_tree)
        print(f"WHERE {sql_where}")
    except Exception as e:
        print(f"Error generating SQL: {e}", file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    main()
