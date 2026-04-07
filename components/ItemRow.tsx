type Item = {
  id: number;
  name: string;
  price: number;
};

type ItemRowProps = {
  item: Item;
  isSelected: boolean;
  onToggle: (id: number) => void;
  assignedTo?: string;
};

export default function ItemRow({
  item,
  isSelected,
  onToggle,
  assignedTo,
}: ItemRowProps) {
  return (
    <div
      onClick={() => onToggle(item.id)}
      className={`flex justify-between p-3 border-b cursor-pointer rounded transition-all duration-200
    ${isSelected ? "bg-blue-100 text-black" : ""}
  `}
    >
      <div>
        <span>
          {isSelected ? "✅ " : "⬜️ "}
          {item.name}
        </span>

        {assignedTo && (
          <div className="text-xs text-gray-400">{assignedTo}</div>
        )}
      </div>

      <span>£{item.price.toFixed(2)}</span>
    </div>
  );
}
