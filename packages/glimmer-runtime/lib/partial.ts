import { SerializedTemplate } from 'glimmer-wire-format';

export class PartialDefinition {
  name: string;
  serializedTemplate: SerializedTemplate;

  constructor(name: string, serializedTemplate: SerializedTemplate) {
    this.name = name;
    this.serializedTemplate = serializedTemplate;
  }

}
