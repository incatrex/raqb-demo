#!/usr/bin/env python3
"""
JSON Schema Validator

This script validates one or more JSON files against a JSON Schema and logs any validation errors.
It supports wildcard pattern matching for the source path.

Usage:
    python json_validator.py --source_path <path> --schema_path <schema> --log_file <log>

    --source_path: Path to a JSON file or directory (supports wildcard patterns)
    --schema_path: Path to the JSON schema file
    --log_file: Path to the log file where validation errors will be recorded
"""

import argparse
import glob
import json
import logging
import os
import sys
from typing import List, Dict, Any, Union

try:
    import jsonschema
except ImportError:
    print("Error: jsonschema package is not installed.")
    print("Please install it using: pip install jsonschema")
    sys.exit(1)


def setup_logging(log_file: str) -> logging.Logger:
    """Set up logging to file and console."""
    logger = logging.getLogger('json_validator')
    logger.setLevel(logging.INFO)
    
    # File handler
    file_handler = logging.FileHandler(log_file, mode='w')
    file_handler.setLevel(logging.INFO)
    
    # Console handler
    console_handler = logging.StreamHandler()
    console_handler.setLevel(logging.INFO)
    
    # Format
    formatter = logging.Formatter('%(asctime)s - %(levelname)s - %(message)s')
    file_handler.setFormatter(formatter)
    console_handler.setFormatter(formatter)
    
    # Add handlers
    logger.addHandler(file_handler)
    logger.addHandler(console_handler)
    
    return logger


def load_json_file(file_path: str) -> Union[Dict[str, Any], List[Any]]:
    """Load and parse a JSON file."""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            return json.load(f)
    except json.JSONDecodeError as e:
        raise ValueError(f"Invalid JSON in {file_path}: {str(e)}")
    except Exception as e:
        raise ValueError(f"Failed to load {file_path}: {str(e)}")


def get_json_files(source_path: str) -> List[str]:
    """Get list of JSON files from source path, supporting wildcard patterns."""
    if os.path.isfile(source_path):
        return [source_path] if source_path.lower().endswith('.json') else []
    
    # Handle directory with potential wildcards
    files = []
    
    # If there's a wildcard in the path
    if '*' in source_path:
        files = glob.glob(source_path)
        # Keep only .json files
        files = [f for f in files if os.path.isfile(f) and f.lower().endswith('.json')]
    else:
        # It's a directory without wildcards
        if os.path.isdir(source_path):
            # Get all .json files in the directory
            for root, _, filenames in os.walk(source_path):
                for filename in filenames:
                    if filename.lower().endswith('.json'):
                        files.append(os.path.join(root, filename))
    
    return files


def validate_json_against_schema(json_data: Union[Dict[str, Any], List[Any]], 
                                schema: Dict[str, Any], 
                                file_path: str, 
                                logger: logging.Logger) -> bool:
    """Validate JSON data against a schema."""
    try:
        jsonschema.validate(instance=json_data, schema=schema)
        logger.info(f"Validation successful: {file_path}")
        return True
    except jsonschema.exceptions.ValidationError as e:
        # Get the path in the document where the error occurred
        path = '/'.join(str(p) for p in e.absolute_path)
        if not path:
            path = "(root level)"
        else:
            path = f"at path '{path}'"

        logger.error(f"Validation error in {file_path} {path}: {e.message}")
        return False
    except Exception as e:
        logger.error(f"Unexpected error validating {file_path}: {str(e)}")
        return False


def main():
    parser = argparse.ArgumentParser(description='Validate JSON files against a schema.')
    parser.add_argument('--source_path', required=True, 
                        help='Path to JSON file or directory (supports wildcards)')
    parser.add_argument('--schema_path', required=True, 
                        help='Path to the JSON schema file')
    parser.add_argument('--log_file', required=True, 
                        help='Path to the log file')
    
    args = parser.parse_args()
    
    # Set up logging
    logger = setup_logging(args.log_file)
    logger.info(f"Starting JSON validation")
    logger.info(f"Source path: {args.source_path}")
    logger.info(f"Schema path: {args.schema_path}")
    
    try:
        # Load the schema
        schema = load_json_file(args.schema_path)
        logger.info(f"Successfully loaded schema from {args.schema_path}")
        
        # Get list of JSON files to validate
        json_files = get_json_files(args.source_path)
        
        if not json_files:
            logger.warning(f"No JSON files found at {args.source_path}")
            return
        
        logger.info(f"Found {len(json_files)} JSON file(s) to validate")
        
        # Validate each file
        valid_count = 0
        error_count = 0
        
        for file_path in json_files:
            try:
                logger.info(f"Validating {file_path}")
                json_data = load_json_file(file_path)
                
                if validate_json_against_schema(json_data, schema, file_path, logger):
                    valid_count += 1
                else:
                    error_count += 1
                    
            except ValueError as e:
                logger.error(str(e))
                error_count += 1
                continue
        
        # Summary
        logger.info(f"Validation complete. {valid_count} valid file(s), {error_count} file(s) with errors")
        
    except Exception as e:
        logger.error(f"An error occurred: {str(e)}")
        return


if __name__ == "__main__":
    main()
