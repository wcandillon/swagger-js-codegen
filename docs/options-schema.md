`getAngularCode()`, `getNodeCode()`, and `getCustomCode()` each support the following options:

```yaml
  moduleName:
    type: string
    description: Your AngularJS module name
  className:
    type: string
  esnext:
    type: boolean
    description: passed through to jslint
  mustache:
    type: object
    description: See the 'Custom Mustache Variables' section below
  swagger:
    type: object
    required: true
    properties:
      swagger:
        description: |
          For Swagger Specification version 2.0 value of field 'swagger' must be a string '2.0'
        type: string
        enum:
        - 2.0
        - 1.2
      info:
        type: object
        properties:
          description:
            type: string
            description: Made available to templates as '{{&description}}'
      securityDefinitions:
        type: object
        description:
      parameters:
        type: array
        items:
          type: object
          properties:
            name:
              type: string
              required: true
            enum:
              type: array
            in:
              type: string
              enum:
              - body
              - path
              - query
              - header
              - formData
```