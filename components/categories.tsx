"use client";

import qs from "query-string";
import { Category } from "@prisma/client";
import { useRouter, useSearchParams } from "next/navigation";

import { cn } from "@/lib/utils";

interface CategoriesProps {
  data: Category[];
}

export const Categories = ({ data }: CategoriesProps) => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const categoryId = searchParams.get("categoryId");

  const onClick = (id: string | undefined) => {
    if (id === categoryId) {
      id = undefined;
    }
    const query = { categoryId: id };
    const url = qs.stringifyUrl(
      { url: window.location.href, query },
      { skipNull: true }
    );

    router.push(url);
  };
  console.log(categoryId);
  return (
    <div className="w-full overflow-x-auto space-x-2 flex p-1">
      <button
        onClick={() => onClick(undefined)}
        key={"reset"}
        className={cn(
          "flex items-center text-center text-xs md:text-sm px-2 md:px-4 py-2 md:py-3 rounded-md bg-primary/10 hover:opacity-75 transition",
          null === categoryId ? "bg-primary/25" : "bg-primary/10"
        )}
      >
        Tout voir
      </button>
      {data.map((category) => (
        <button
          onClick={() => onClick(category.id)}
          key={category.id}
          className={cn(
            "flex items-center text-center text-xs md:text-sm px-2 md:px-4 py-2 md:py-3 rounded-md bg-primary/10 hover:opacity-75 transition",
            category.id === categoryId ? "bg-primary/25" : "bg-primary/10"
          )}
        >
          {category.name}
        </button>
      ))}
    </div>
  );
};
