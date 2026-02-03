import Link from "next/link";
import { Play } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface MediaCardProps {
    title: string;
    category: string;
    imageUrl: string;
    link: string;
}

export function MediaCard({
    title = "Irabazi Arte",
    category = "Ficción",
    imageUrl = "https://images.unsplash.com/photo-1593784991095-a205069470b6?q=80&w=2070&auto=format&fit=crop", // Placeholder
    link = "#",
}: Partial<MediaCardProps>) {
    return (
        <Card className="overflow-hidden border-none shadow-lg hover:shadow-xl transition-shadow duration-300 max-w-sm mt-4 bg-white">
            <div className="relative aspect-video w-full overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                    src={imageUrl}
                    alt={title}
                    className="object-cover w-full h-full hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-2 left-2">
                    <Badge className="bg-red-600 hover:bg-red-700 text-white border-none backdrop-blur-sm">
                        {category}
                    </Badge>
                </div>
            </div>
            <CardContent className="p-4 space-y-3">
                <h3 className="font-serif font-bold text-xl text-gray-900">{title}</h3>
                <Button
                    asChild
                    className="w-full bg-red-600 hover:bg-red-700 text-white font-medium group"
                >
                    <Link href={link}>
                        <Play className="w-4 h-4 mr-2 fill-current" />
                        Ikusi Nahieran
                    </Link>
                </Button>
            </CardContent>
        </Card>
    );
}
