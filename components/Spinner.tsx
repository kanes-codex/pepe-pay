import Image from "next/image";

export default function Spinner() {
  return (
    <div className="flex flex-col items-center justify-center mt-6">
      <Image
        src="/pepe-spinner.png"
        alt="Loading..."
        width={96}
        height={96}
        className="animate-spin"
      />
      <p className="mt-2 text-sm text-gray-600">
        Pepe is calculating debts... 🧠💸
      </p>
    </div>
  );
}
