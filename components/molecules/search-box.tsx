import { Input } from "@/components/ui/input";
import { LucideSearch } from "lucide-react";

export default function SearchBox() {
    return (
        <div className="w-[340px]  relative flex gap-1 items-center">
        <LucideSearch className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400" />
        <Input className="rounded-full pl-8"  placeholder="Search"/>
        {/* <Button className="rounded-full">Search</Button> */}
        </div>
    )
}