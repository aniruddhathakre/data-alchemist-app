import { ThemeToggle } from "@/components/theme-toggle";

export function Header() {
  return (
    <header className="border-b">
      <div className="container mx-auto flex h-16 items-center justify-between p-4">
        <h1 className="text-xl font-bold tracking-tight">Data Alchemist</h1>
        <ThemeToggle />
      </div>
    </header>
  );
}
