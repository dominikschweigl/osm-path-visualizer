import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/typography";
import { ChevronRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function Page404() {
  return (
    <div className="flex flex-col lg:flex-row items-center justify-center h-full gap-8 md:gap-16 p-4">
      <Image src={"404.png"} alt="404" width={400} height={400} className="w-[min(400px,90%)]" />
      <div className="max-w-[400px] lg:max-w-[480px] flex flex-col gap-6 mb-16">
        <Text as={"h1"} element="h1" className="font-semibold text-3xl sm:text-4xl">
          404 | Page not found.
        </Text>
        <Text as={"p"} element="p" className="-mt-3 mb-2 sm:mb-0 lg:mt-0">
          It looks like you&apos;ve stumbled upon a page that doesn&apos;t exist. But don&apos;t worry, you&apos;re not lost — just a little off track.
        </Text>
        <Link href={"/"}>
          <Button className="gap-1.5 lg:mt-4 w-full lg:w-fit" size={"lg"}>
            Back To Pathfinder
            <ChevronRight className="size-5" />
          </Button>
        </Link>
      </div>
    </div>
  );
}
