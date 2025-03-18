import { ArrowRight } from "lucide-react"
import type { LucideIcon } from "lucide-react"
import { Button } from "@/components/ui/button"

interface ButtonExpandProps {
  text: string;
  icon?: LucideIcon;
  bgColor?: string;
  textColor?: string;
  hoverBgColor?: string;
  hoverTextColor?: string;
  onClick?: () => void;
  className?: string;
  iconPlacement?: 'left' | 'right';
  type?: 'button' | 'submit' | 'reset';
}

function ButtonExpand({
  text,
  icon = ArrowRight,
  bgColor = "bg-green-50 dark:bg-green-900/30",
  textColor = "text-green-700 dark:text-green-300",
  hoverBgColor = "hover:bg-green-100 dark:hover:bg-green-900/40",
  hoverTextColor = "hover:text-green-800 dark:hover:text-green-200",
  onClick,
  className,
  iconPlacement = 'right',
  type = 'button'
}: ButtonExpandProps) {
  return (
    <Button
      type={type}
      variant="expandIcon"
      icon={icon}
      iconPlacement={iconPlacement}
      className={`text-lg sm:text-base font-medium ${textColor} ${hoverTextColor} ${bgColor} ${hoverBgColor} shadow-lg transition-all duration-300 h-[52px] sm:h-10 px-[32px] sm:px-4 focus:outline-none focus-visible:outline-none ${className}`}
      onClick={onClick}
    >
      {text}
    </Button>
  )
}

// Pre-configured button for Connect action
function ButtonExpandIconRight() {
  return (
    <ButtonExpand
      text={"Connect"}
      onClick={() => window.location.href = '/sign-in'}
    />
  )
}

export {
  ButtonExpand,
  ButtonExpandIconRight,
}
