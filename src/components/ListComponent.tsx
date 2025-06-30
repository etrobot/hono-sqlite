import React from 'react';

interface ListItem {
  id: string;
  [key: string]: any;
}

interface ListComponentProps {
  title: string;
  items: ListItem[];
  renderItem?: (item: ListItem) => React.ReactNode;
  addFormComponent: React.ReactNode;
  emptyMessage?: string;
  type?: 'project' | 'default';
  onEdit?: (item: ListItem) => void;
  onDelete?: (item: ListItem) => void;
}

const ListComponent: React.FC<ListComponentProps> = ({
  title,
  items,
  renderItem,
  addFormComponent,
  emptyMessage = '暂无内容',
  type = 'default',
  onEdit,
  onDelete,
}) => {
  // 默认渲染函数
  const defaultRenderItem = (item: ListItem) => {
    if (type === 'project') {
      return (
        <li key={item.id} className="flex items-center justify-between py-2 border-b">
          <span>{item.key}</span>
          <button
            className="text-red-500 hover:text-red-700 ml-2"
            onClick={() => onDelete && onDelete(item)}
          >
            删除
          </button>
        </li>
      );
    }
    return (
      <li key={item.id} className="flex items-center justify-between py-2 border-b">
        <span className="mr-2">{item.key}</span>
        <span className="mr-2">{item.value}</span>
        <button
          className="text-blue-500 hover:text-blue-700 mr-2"
          onClick={() => onEdit && onEdit(item)}
        >
          编辑
        </button>
        <button
          className="text-red-500 hover:text-red-700"
          onClick={() => onDelete && onDelete(item)}
        >
          删除
        </button>
      </li>
    );
  };

  const render = renderItem || defaultRenderItem;

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">{title}</h2>
      <ul>
        {items.length === 0 ? (
          <li className="text-gray-500">{emptyMessage}</li>
        ) : (
          items.map(item => render(item))
        )}
      </ul>
      <div className="mt-6">
        {addFormComponent}
      </div>
    </div>
  );
};

export default ListComponent;
