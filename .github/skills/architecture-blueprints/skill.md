---
name: architecture-blueprint-generator
description: 'Comprehensive project architecture blueprint generator that analyzes codebases to create detailed architectural documentation. Automatically detects technology stacks and architectural patterns, generates visual diagrams, documents implementation patterns, and provides extensible blueprints for maintaining architectural consistency and guiding new development.'
---

# Comprehensive Project Architecture Blueprint Generator

## Configuration Variables
${PROJECT_TYPE="Auto-detect|.NET|Java|React|Angular|Python|Node.js|Flutter|Other"}
${ARCHITECTURE_PATTERN="Auto-detect|Clean Architecture|Microservices|Layered|MVVM|MVC|Hexagonal|Event-Driven|Serverless|Monolithic|Other"}
${DIAGRAM_TYPE="C4|UML|Flow|Component|None"}
${DETAIL_LEVEL="High-level|Detailed|Comprehensive|Implementation-Ready"}
${INCLUDES_CODE_EXAMPLES=true|false}
${INCLUDES_IMPLEMENTATION_PATTERNS=true|false}
${INCLUDES_DECISION_RECORDS=true|false}
${FOCUS_ON_EXTENSIBILITY=true|false}

## Generated Prompt

"Create a comprehensive 'Project_Architecture_Blueprint.md' document that thoroughly analyzes the architectural patterns in the codebase to serve as a definitive reference for maintaining architectural consistency."
