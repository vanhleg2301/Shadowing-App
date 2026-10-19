import { AuthButton } from "@/components/AuthButton";

interface SignInPromptProps {
  message: string;
}

export function SignInPrompt({ message }: SignInPromptProps) {
  return (
    <div className="mt-8 max-w-md rounded-3xl border border-line bg-white p-6 shadow-[0_4px_0_0_var(--color-line)]">
      <p className="text-ink">{message}</p>
      <div className="mt-4">
        <AuthButton variant="full" />
      </div>
    </div>
  );
}
