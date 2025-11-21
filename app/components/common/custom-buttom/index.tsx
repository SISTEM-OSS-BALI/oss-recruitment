import { Button } from "antd";
import { ButtonProps } from "antd/es/button";

interface CustomButtonProps extends ButtonProps {
  onClick?: () => void;
  title: string;
  icon?: React.ReactNode;
}

export default function CustomButton({
  onClick,
  title,
  icon,
  color,
  style,
  ...rest
}: CustomButtonProps) {
  return (
    <Button
      onClick={onClick}
      icon={icon}
      style={{ backgroundColor: "#C62828", color: color, ...style }}
      type="primary"
      {...rest}
    >
      {title}
    </Button>
  );
}
