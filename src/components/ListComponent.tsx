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
  selectedId?: string;
  onSelect?: (item: ListItem) => void;
  onCopy?: (item: ListItem) => void;
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
  selectedId,
  onSelect,
  onCopy,
}) => {
  // 默认渲染函数
  const defaultRenderItem = (item: ListItem) => (
    <li
      key={item.id}
      className={`flex p-3 hover:bg-zinc-800 rounded-sm justify-between items-center border-darcula-border border-b cursor-pointer ${
        type === 'project' && selectedId === item.id ? 'bg-zinc-900 font-bold' : ''
      }`}
      onClick={() => onSelect && onSelect(item)}
    >
        <span className='font-bold'>{item.key}</span>
        <div className='flex items-center gap-3'>
          {item.value !== undefined && (
            <span className="ml-2">{item.value}</span>
          )}
          {type !== 'project' && onEdit && (
            <button
              className="text-white hover:text-white px-3 py-1 rounded-sm bg-teal-600"
              onClick={e => { e.stopPropagation(); onEdit(item); }}
            >
              编辑
            </button>
          )}
          {type !== 'project' && onCopy && (
            <button
              className="text-white hover:text-white px-3 py-1 rounded-sm bg-amber-600"
              onClick={e => { e.stopPropagation(); onCopy(item); }}
            >
              复制
            </button>
          )}
          <button
            className="text-white hover:text-white px-3 py-1 rounded-sm bg-orange-600"
            onClick={e => { e.stopPropagation(); onDelete && onDelete(item); }}
          >
            删
          </button>
        </div>
    </li>
  );

  const render = renderItem || defaultRenderItem;

  return (
    <div>
      <h2 className="text-xl">{title}</h2>
      {addFormComponent}
      <ul>
        {items.length === 0 ? (
          <li className="text-gray-500">{emptyMessage}</li>
        ) : (
          items.map(item => render(item))
        )}
      </ul>
    </div>
  );
};

export default ListComponent;
