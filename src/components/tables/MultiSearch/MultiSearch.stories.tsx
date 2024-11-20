
import { getDay as dateGetDay, startOfDay as dateStartOfDay, endOfDay as dateEndOfDay, sub as dateSub } from 'date-fns';

import * as React from 'react';
import * as StorybookKnobs from '@storybook/addon-knobs';

import { StoryMetadata } from '../../../types/storyMetadata';

import { Panel } from '../../../components/containers/panel/Panel';
import * as MultiSearch from './MultiSearch';


export default {
  title: 'Prefab/Forms/MultiSearch',
  decorators: [
    StorybookKnobs.withKnobs,
    renderStory => <Panel>{renderStory()}</Panel>,
  ],
  component: MultiSearch,
} as StoryMetadata;

export const Standard = () => {
  const severityFieldSpec: MultiSearch.EnumFieldSpec = {
    type: 'enum',
    operators: ['$eq', '$ne', '$in', '$nin'],
    label: 'Severity',
    alternatives: {
      INFO: { label: 'Info' },
      WARNING: { label: 'Warning' },
      ERROR: { label: 'Error' },
      CRITICAL: { label: 'Critical' },
    },
  };

  const keyOpsFieldSpec: MultiSearch.ArrayFieldSpec = {
    type: 'array',
    operators: ['$eq', '$ne', '$any', '$all'],
    label: 'Key Ops',
    subfield: {
      type: 'enum',
      operators: ['$in', '$nin'],
      label: 'Key Ops',
      alternatives: {
        ENCRYPT: { label: 'Encrypt' },
        DECRYPT: { label: 'Decrypt' },
        WRAP: { label: 'Wrap' },
        UNWRAP: { label: 'Unwrap' },
      },
      operatorInfo: {
        '$in': { label: 'one of' },
        '$nin': { label: 'none of' },
      },
    },
  };
  
  const initiatorFieldSpec: MultiSearch.TextFieldSpec = {
    type: 'text',
    operators: ['$text'],
    label: 'Initiator',
    placeholder: 'Search initiator',
  };

  const countFieldSpec: MultiSearch.Field = {
    type: 'number',
    operators: ['$eq', '$lt', '$lte', '$gt', '$gte', '$ne'],
    label: 'Count',
    placeholder: 'Search ip-address',
  };
  
  const customAttributesFieldSpec: MultiSearch.DictionaryFieldSpec = {
    type: 'dictionary',
    operators: ['$all'],
    label: 'Custom Attributes',
    suggestedKeys: {
      vehicle: { label: 'Vehicle' },
      book: { label: 'Book' },
    },
  };
  
  const createdAtFieldSpec: MultiSearch.DateTimeFieldSpec = {
    type: 'datetime',
    operators: ['$gt', '$range'],
    label: 'Created',
    placeholder: 'Search',
    minDate: dateSub(dateStartOfDay(new Date()), { days: 10 }),
    maxDate: dateEndOfDay(new Date()),
  };
  
  const fields = {
    severity: severityFieldSpec,
    keyOps: keyOpsFieldSpec,
    initiator: initiatorFieldSpec,
    count: countFieldSpec,
    custom: customAttributesFieldSpec,
    createdAt: createdAtFieldSpec,
  };
  
  const defaultFilters = [{
    fieldName: 'initiator',
    operation: {
      $text: {
        $search: 'info',
      },
    },
  }];

  const [filters, setFilters] = React.useState<MultiSearch.FilterQuery>(defaultFilters);
  
  const query = (filter: MultiSearch.FilterQuery) => setFilters(filter);

  return (
    <MultiSearch.MultiSearch fields={fields} query={query} filters={filters} />
  );
};

export const WithValidation = () => {
  const uuidFieldSpec: MultiSearch.TextFieldSpec = {
    type: 'text',
    operators: ['$text'],
    label: 'UUID',
    placeholder: '18DA82C7-E445-48CB-90F3-8A159741C85E',
    validator: ({ buffer }) => {
      const isValid = /^[0-9A-F]{8}-[0-9A-F]{4}-4[0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i.test(buffer);
      return {
        isValid,
        message: isValid ? '' : 'Please enter a valid UUID',
      };
    },
  };
  
  const severityFieldSpec: MultiSearch.EnumFieldSpec = {
    type: 'enum',
    operators: ['$eq', '$ne', '$in', '$nin'],
    label: 'Severity',
    alternatives: {
      INFO: { label: 'Info' },
      WARNING: { label: 'Warning' },
      ERROR: { label: 'Error' },
      CRITICAL: { label: 'Critical' },
    },
    validator: ({ buffer }) => {
      const isValid = buffer.toLowerCase() !== '';
      return {
        isValid,
        message: isValid ? '' : 'Please enter a valid severity',
      };
    },
  };

  const keyOpsFieldSpec: MultiSearch.ArrayFieldSpec = {
    type: 'array',
    operators: ['$eq', '$ne', '$any', '$all'],
    label: 'Key Ops',
    subfield: {
      type: 'enum',
      operators: ['$in', '$nin'],
      label: 'Key Ops',
      alternatives: {
        ENCRYPT: { label: 'Encrypt' },
        DECRYPT: { label: 'Decrypt' },
        WRAP: { label: 'Wrap' },
        UNWRAP: { label: 'Unwrap' },
      },
      operatorInfo: {
        '$in': { label: 'one of' },
        '$nin': { label: 'none of' },
      },
    },
    validator: ({ buffer }) => {
      const isValid = buffer.includes('ENCRYPT');
      return {
        isValid,
        message: isValid ? '' : 'Keys ops must include "Encrypt"',
      };
    },
  };

  const countFieldSpec: MultiSearch.Field = {
    type: 'number',
    operators: ['$eq', '$lt', '$lte', '$gt', '$gte', '$ne'],
    label: 'Count',
    placeholder: 'Search ip-address',
    validator: ({ buffer }) => {
      const isValid = /^[0-9]*$/.test(buffer);
      return {
        isValid,
        message: isValid ? '' : 'Please enter a valid number',
      };
    },
  };
  
  const customAttributesFieldSpec: MultiSearch.DictionaryFieldSpec = {
    type: 'dictionary',
    operators: ['$all'],
    label: 'Custom attributes',
    suggestedKeys: {
      vehicle: { label: 'Vehicle' },
      book: { label: 'Book' },
    },
    validator: ({ key, buffer }) => {
      const isValid = key.toLowerCase() === 'book' && buffer.toLowerCase() === 'data structure';
      return {
        isValid,
        message: isValid ? '' : 'Please enter a valid attribute',
      };
    },
  };
  
  const createdAtFieldSpec: MultiSearch.DateTimeFieldSpec = {
    type: 'datetime',
    operators: ['$gt', '$range'],
    label: 'Created',
    placeholder: 'Search',
    minDate: dateSub(dateStartOfDay(new Date()), { days: 10 }),
    maxDate: dateEndOfDay(new Date()),
    validator: ({ dateTime, startDateTime, endDateTime }) => {
      const isValid = dateGetDay(endDateTime) !== 0; // Day must not be Sunday (random validation rule for testing)
      return { isValid, message: !isValid ? 'Please pick an end day other than Sunday' : '' };
    },
  };
  
  const fields = {
    uuid: uuidFieldSpec,
    severity: severityFieldSpec,
    keyOps: keyOpsFieldSpec,
    count: countFieldSpec,
    custom: customAttributesFieldSpec,
    createdAt: createdAtFieldSpec,
  };
  
  const [filters, setFilters] = React.useState<MultiSearch.FilterQuery>([]);
  
  const query = (filter: MultiSearch.FilterQuery) => setFilters(filter);

  return (
    <MultiSearch.MultiSearch fields={fields} query={query} filters={filters} />
  );
};
