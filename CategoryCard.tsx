import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface CategoryCardProps {
  title: string;
  icon: LucideIcon;
  description: string;
  href: string;
}

const CategoryCard = ({ title, icon: Icon, description, href }: CategoryCardProps) => {
  return (
    <Link to={href}>
      <Card className="group cursor-pointer overflow-hidden transition-all hover:shadow-md hover:border-primary/50">
        <CardContent className="flex flex-col items-center justify-center p-6 text-center">
          <div className="mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-secondary transition-colors group-hover:bg-primary/10">
            <Icon className="h-8 w-8 text-primary" />
          </div>
          <h3 className="font-semibold mb-1">{title}</h3>
          <p className="text-xs text-muted-foreground">{description}</p>
        </CardContent>
      </Card>
    </Link>
  );
};

export default CategoryCard;
