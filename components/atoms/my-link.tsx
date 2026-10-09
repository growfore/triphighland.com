import Link from "next/link";

export default function MyLink({
  href,
  text,
  comma,
}: {
  href: string;
  text: string;
  comma?: boolean;
}) {
  return (
    <span>
      {" "}
      <Link href={href} className="text-primary underline">
        {text}
      </Link>
      {comma && ","}{" "}
    </span>
  );
}
