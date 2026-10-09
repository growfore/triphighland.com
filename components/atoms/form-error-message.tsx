export function FormErrorMessage({ message }: Readonly<{ message: string }>) {
    return <p className="text-sm text-red-500">{message}</p>;
  }