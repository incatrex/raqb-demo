import React, { Component } from "react";
import merge from "lodash/merge";
import {
  BasicFuncs, Utils, BasicConfig,
  // types:
  Operators, Fields, Func, Types, Conjunctions, LocaleSettings, Funcs, DateTimeWidget, FuncWidget, SelectWidget, 
  Settings,
  DateTimeFieldSettings, TextFieldSettings, SelectFieldSettings, MultiSelectFieldSettings, NumberFieldSettings,
  TextWidgetProps,
  WidgetProps,
  Widgets,
  TextWidget,
  TreeSelectWidget,
  Config,
  ValidateValue,
} from "@react-awesome-query-builder/ui";
import moment from "moment";
import ru_RU from "antd/es/locale/ru_RU";
import { ruRU } from "@material-ui/core/locale";
import { ruRU as muiRuRU } from "@mui/material/locale";
import { AntdWidgets } from "@react-awesome-query-builder/antd";
import { skinToConfig } from "../../skins";

const {
  FieldSelect,
  FieldDropdown,
  FieldCascader,
  FieldTreeSelect,
} = AntdWidgets;
const { simulateAsyncFetch } = Utils.Autocomplete;


export default (skin: string) => {
  const originalConfig = skinToConfig[skin] as BasicConfig;
  const InitialConfig = originalConfig as BasicConfig;

  const demoListValues = [
    { title: "A", value: "a" },
    { title: "AA", value: "aa" },
    { title: "AAA1", value: "aaa1" },
    { title: "AAA2", value: "aaa2" },
    { title: "B", value: "b" },
    { title: "C", value: "c" },
    { title: "D", value: "d" },
    { title: "E", value: "e" },
    { title: "F", value: "f" },
    { title: "G", value: "g" },
    { title: "H", value: "h" },
    { title: "I", value: "i" },
    { title: "J", value: "j" },
  ];
  const simulatedAsyncFetch = simulateAsyncFetch(demoListValues, 3);

  const conjunctions: Conjunctions = {
    ...InitialConfig.conjunctions,
  };

  const operators: Operators = 
  {
    ...InitialConfig.operators,
    plus: {
      label: '+',
      labelForFormat: '+',
      valueSources: ['value', 'field'],
      cardinality: 1,
      formatOp: (field, op, value) => `(${field} + ${value})`,
      sqlFormatOp: (field, op, value) => `(${field} + ${value[0]})`,
      mongoFormatOp: (field, op, value) => ({ $add: [field, value[0]] }),
    }
  };


  const widgets: Widgets = {
    ...InitialConfig.widgets,
    // examples of overriding
    text: {
      ...InitialConfig.widgets.text
    },
    textarea: {
      ...InitialConfig.widgets.textarea,
      maxRows: 3
    },
    slider: {
      ...InitialConfig.widgets.slider
    },
    rangeslider: {
      ...InitialConfig.widgets.rangeslider
    },
    date: {
      ...InitialConfig.widgets.date,
      dateFormat: "DD.MM.YYYY",
      valueFormat: "YYYY-MM-DD",
    },
    time: {
      ...InitialConfig.widgets.time,
      timeFormat: "HH:mm",
      valueFormat: "HH:mm:ss",
    },
    datetime: {
      ...InitialConfig.widgets.datetime,
      timeFormat: "HH:mm",
      dateFormat: "DD.MM.YYYY",
      valueFormat: "YYYY-MM-DD HH:mm:ss",
    },
    func: {
      ...InitialConfig.widgets.func,
      customProps: {
        showSearch: true
      }
    },
    select: {
      ...InitialConfig.widgets.select,
    },
    multiselect: {
      ...InitialConfig.widgets.multiselect,
      customProps: {
        //showCheckboxes: false,
        width: "200px",
        input: {
          width: "100px"
        }
      }
    },
    treeselect: {
      ...InitialConfig.widgets.treeselect,
      customProps: {
        showSearch: true
      }
    },
  };


  const types = {
    ...InitialConfig.types,
    number: {
      ...InitialConfig.types.number,
      operators: [
        ...(InitialConfig.types.number.operators || []),
        'plus',
      ]
    }
  };


  const localeSettings: LocaleSettings = {
    locale: {
      moment: "ru",
      antd: ru_RU,
      material: ruRU,
      mui: muiRuRU
    },
    valueLabel: "Value",
    valuePlaceholder: "Value",
    fieldLabel: "Field",
    operatorLabel: "Operator",
    funcLabel: "Function",
    fieldPlaceholder: "Select field",
    funcPlaceholder: "Select function",
    operatorPlaceholder: "Select operator",
    lockLabel: "Lock",
    lockedLabel: "Locked",
    deleteLabel: undefined,
    addGroupLabel: "Add group",
    addRuleLabel: "Add rule",
    addSubRuleLabel: "Add sub rule",
    addSubGroupLabel: "Add sub group",
    delGroupLabel: undefined,
    notLabel: "Not",
    fieldSourcesPopupTitle: "Select source",
    valueSourcesPopupTitle: "Select value source",
    removeRuleConfirmOptions: {
      title: "Are you sure delete this rule?",
      okText: "Yes",
      okType: "danger",
      cancelText: "Cancel"
    },
    removeGroupConfirmOptions: {
      title: "Are you sure delete this group?",
      okText: "Yes",
      okType: "danger",
      cancelText: "Cancel"
    },
    loadMoreLabel: "Load more...",
    loadingMoreLabel: "Loading more...",
    typeToSearchLabel: "Type to search",
    loadingLabel: "Loading...",
    notFoundLabel: "Not found",
  };

  const settings: Settings = {
    ...InitialConfig.settings,
    ...localeSettings,

    defaultSliderWidth: "200px",
    defaultSelectWidth: "200px",
    defaultSearchWidth: "100px",
    defaultMaxRows: 5,

    // Example of how to correctly configure default LHS funtion with args:
    // defaultField: {
    //   func: "date.RELATIVE_DATETIME",
    //   args: {
    //     date: {
    //       value: {func: "date.NOW", args: {}},
    //       valueSrc: "func"
    //     },
    //     op: {
    //       value: "plus",
    //       valueSrc: "value"
    //     },
    //     dim: {
    //       value: "day",
    //       valueSrc: "value"
    //     },
    //     val: {
    //       value: 1,
    //       valueSrc: "value"
    //     }
    //   }
    // },

    valueSourcesInfo: {
      value: {
        label: "Value"
      },
      field: {
        label: "Field",
        widget: "field",
      },
      func: {
        label: "Function",
        widget: "func",
      }
    },
    fieldSources: ["field", "func"],
    keepInputOnChangeFieldSrc: true,
    reverseOperatorsForNot: true,
    canShortMongoQuery: true,
    // canReorder: true,
    // canRegroup: true,
    // showLock: true,
    // showNot: true,
    // showLabels: true,
    maxNesting: 5,
    canLeaveEmptyGroup: true,
    shouldCreateEmptyGroup: false,
    showErrorMessage: true,
    removeEmptyGroupsOnLoad: false,
    removeEmptyRulesOnLoad: false,
    removeIncompleteRulesOnLoad: false,
    customFieldSelectProps: {
      showSearch: true
    },
    customOperatorSelectProps: {
      // showSearch: true
    },
    // renderField: (props) => <FieldCascader {...props} />,
    // renderOperator: (props) => <FieldDropdown {...props} />,
    // renderFunc: (props) => <FieldSelect {...props} />,
    // maxNumberOfRules: 10 // number of rules can be added to the query builder

    // defaultField: "user.firstName",
    // defaultOperator: "starts_with",

    // canCompareFieldWithField: (leftField, leftFieldConfig, rightField, rightFieldConfig, op) => {
    //   if (leftField === 'slider' && rightField === 'results.score') {
    //     return false;
    //   }
    //   return true;
    // }

    // // enable ternary mode with number as case value
    // caseValueField: {
    //   mainWidgetProps: {
    //     valueLabel: "Then",
    //     valuePlaceholder: "Then",
    //   },
    //   type: "number",
    //   fieldSettings: {
    //     min: 0,
    //     max: 10,
    //   },
    //   valueSources: ["value"],
    // },
  };

  //////////////////////////////////////////////////////////////////////

  const fields: Fields = {
    
    // Define the table structure with field groups
    "TABLE1": {
      type: "!struct",
      label: "TABLE1",
      subfields: {
        // Number fields
        "NUMBER_FIELD_01": {
          label: "NUMBER_FIELD_01",
          type: "number",
          valueSources: ["value", "field", "func"],
        },
        "NUMBER_FIELD_02": {
          label: "NUMBER_FIELD_02",
          type: "number",
          valueSources: ["value", "field", "func"],
        },
        "NUMBER_FIELD_03": {
          label: "NUMBER_FIELD_03",
          type: "number",
          valueSources: ["value", "field", "func"],
        },
        
        // Text fields
        "TEXT_FIELD_01": {
          label: "TEXT_FIELD_01",
          type: "text",
          valueSources: ["value", "field", "func"],
        },
        "TEXT_FIELD_02": {
          label: "TEXT_FIELD_02",
          type: "text",
          valueSources: ["value", "field", "func"],
        },
        "TEXT_FIELD_03": {
          label: "TEXT_FIELD_03",
          type: "text",
          valueSources: ["value", "field", "func"],
        },
        
        // Date fields
        "DATE_FIELD_01": {
          label: "DATE_FIELD_01",
          type: "date",
          valueSources: ["value", "field", "func"],
        },
        "DATE_FIELD_02": {
          label: "DATE_FIELD_02",
          type: "date",
          valueSources: ["value", "field", "func"],
        },
        "DATE_FIELD_03": {
          label: "DATE_FIELD_03",
          type: "date",
          valueSources: ["value", "field", "func"],
        },
        
        // Datetime fields
        "DATETIME_FIELD_01": {
          label: "DATETIME_FIELD_01",
          type: "datetime",
          valueSources: ["value", "field", "func"],
        },
        "DATETIME_FIELD_02": {
          label: "DATETIME_FIELD_02",
          type: "datetime",
          valueSources: ["value", "field", "func"],
        },
        "DATETIME_FIELD_03": {
          label: "DATETIME_FIELD_03",
          type: "datetime",
          valueSources: ["value", "field", "func"],
        },
        
        // Boolean fields
        "BOOLEAN_FIELD_01": {
          label: "BOOLEAN_FIELD_01",
          type: "boolean",
          valueSources: ["value", "field", "func"],
        },
        "BOOLEAN_FIELD_02": {
          label: "BOOLEAN_FIELD_02",
          type: "boolean",
          valueSources: ["value", "field", "func"],
        },
        "BOOLEAN_FIELD_03": {
          label: "BOOLEAN_FIELD_03",
          type: "boolean",
          valueSources: ["value", "field", "func"],
        },
      },
    },

    "TABLE2": {
      type: "!struct",
      label: "TABLE2",
      subfields: {
        // Number fields
        "NUMBER_FIELD_01": {
          label: "NUMBER_FIELD_01",
          type: "number",
          valueSources: ["value", "field", "func"],
        },
        "NUMBER_FIELD_02": {
          label: "NUMBER_FIELD_02",
          type: "number",
          valueSources: ["value", "field", "func"],
        },
        "NUMBER_FIELD_03": {
          label: "NUMBER_FIELD_03",
          type: "number",
          valueSources: ["value", "field", "func"],
        },
        
        // Text fields
        "TEXT_FIELD_01": {
          label: "TEXT_FIELD_01",
          type: "text",
          valueSources: ["value", "field", "func"],
        },
        "TEXT_FIELD_02": {
          label: "TEXT_FIELD_02",
          type: "text",
          valueSources: ["value", "field", "func"],
        },
        "TEXT_FIELD_03": {
          label: "TEXT_FIELD_03",
          type: "text",
          valueSources: ["value", "field", "func"],
        },
        
        // Date fields
        "DATE_FIELD_01": {
          label: "DATE_FIELD_01",
          type: "date",
          valueSources: ["value", "field", "func"],
        },
        "DATE_FIELD_02": {
          label: "DATE_FIELD_02",
          type: "date",
          valueSources: ["value", "field", "func"],
        },
        "DATE_FIELD_03": {
          label: "DATE_FIELD_03",
          type: "date",
          valueSources: ["value", "field", "func"],
        },
        
        // Datetime fields
        "DATETIME_FIELD_01": {
          label: "DATETIME_FIELD_01",
          type: "datetime",
          valueSources: ["value", "field", "func"],
        },
        "DATETIME_FIELD_02": {
          label: "DATETIME_FIELD_02",
          type: "datetime",
          valueSources: ["value", "field", "func"],
        },
        "DATETIME_FIELD_03": {
          label: "DATETIME_FIELD_03",
          type: "datetime",
          valueSources: ["value", "field", "func"],
        },
        
        // Boolean fields
        "BOOLEAN_FIELD_01": {
          label: "BOOLEAN_FIELD_01",
          type: "boolean",
          valueSources: ["value", "field", "func"],
        },
        "BOOLEAN_FIELD_02": {
          label: "BOOLEAN_FIELD_02",
          type: "boolean",
          valueSources: ["value", "field", "func"],
        },
        "BOOLEAN_FIELD_03": {
          label: "BOOLEAN_FIELD_03",
          type: "boolean",
          valueSources: ["value", "field", "func"],
        },
      },
    },  
};

  //////////////////////////////////////////////////////////////////////

  const funcs: Funcs = {
    //...BasicFuncs
    math: {
      type: "!struct",
      label: "Math",
      tooltip: "Mathematical functions",
      subfields: {
          ADD: {
            label: 'ADD',
            returnType: 'number',
            args: [
              { name: 'a', type: 'number' },
              { name: 'b', type: 'number' }
            ],
            renderBrackets: ['(', ')'],
            renderOperator: '+',
            sqlFunc: (args) => `(${args[0]} + ${args[1]})`,
            mongoFunc: (args) => ({ $add: [args[0], args[1]] }),
          },
          SUBTRACT: {
            label: 'SUBTRACT',
            returnType: 'number',
            args: [
              { name: 'a', type: 'number' },
              { name: 'b', type: 'number' }
            ],
            renderBrackets: ['(', ')'],
            renderOperator: '-',
            sqlFunc: (args) => `(${args[0]} - ${args[1]})`,
            mongoFunc: (args) => ({ $subtract: [args[0], args[1]] }),
          },
      }
    },
    string: {
      type: "!struct",
      label: "String",
      tooltip: "String functions",
      subfields: {
        LEN: {
          args: {
            string: {
              label: "String",
              type: "text",
              valueSources: ["field", "value", "func"]
            }
          },
          returnType: "number"
        },        MID: {
          args: {
            string: {
              label: "String",
              type: "text",
              valueSources: ["field", "value", "func"]
            },
            start: {
              label: "Start",
              type: "number",
              valueSources: ["field", "value", "func"]
            },
            len: {
              label: "Length",
              type: "Length",
              valueSources: ["field", "value", "func"]
            }
          },
          returnType: "text"
        },
        TEXT: {
          args: {
            value: {
              label: "Value",
              type: "text",
              valueSources: ["field", "value", "func"]
            },
            format: {
              label: "Format",
              type: "text",
              valueSources: ["field", "value", "func"]
            },
            len: {
              label: "Length",
              type: "Length",
              valueSources: ["field", "value", "func"]
            }
          },
          returnType: "text"
        }
      }
    }
  };

  const ctx = InitialConfig.ctx;

  const config: Config = {
    ctx,
    conjunctions,
    operators,
    widgets,
    types,
    settings,
    fields,
    funcs,
  };

  return config;
};
