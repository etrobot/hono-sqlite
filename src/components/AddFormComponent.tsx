import React from 'react';

interface AddFormComponentProps {
  type?: 'project' | 'default';
  keyValue: string;
  valueValue?: string;
  onKeyChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onValueChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onAdd: () => void;
  keyPlaceholder?: string;
  valuePlaceholder?: string;
  addButtonText?: string;
}

const AddFormComponent: React.FC<AddFormComponentProps> = ({
  type = 'default',
  keyValue,
  valueValue = '',
  onKeyChange,
  onValueChange,
  onAdd,
  keyPlaceholder = 'Key',
  valuePlaceholder = 'Value',
  addButtonText = '添加',
}) => {
  return (
    <div className="flex gap-3 py-4">
      <input
        type="text"
        placeholder={keyPlaceholder}
        value={keyValue}
        onChange={onKeyChange}
        className="bg-darcula-card text-white border border-darcula-border p-3 w-48 rounded-sm"
      />
      {type !== 'project' && (
        <input
          type="text"
          placeholder={valuePlaceholder}
          value={valueValue}
          onChange={onValueChange}
          className="bg-darcula-card text-white border border-darcula-border p-3 w-1/2 rounded-sm"
        />
      )}
      <button
        onClick={onAdd}
        className="bg-teal-600 text-white p-3 flex-1 rounded-sm"
      >
        {addButtonText}
      </button>
    </div>
  );
};

export default AddFormComponent; 