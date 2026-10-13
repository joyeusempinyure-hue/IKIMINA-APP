
import { useNavigate } from "react-router-dom";

function PrimaryButton({
  name,
  icon,
  link,
  onClick,
  type = "button",
  className = "",
}) {
  const navigate = useNavigate();

  const handleClick = () => {
    if (onClick) {
      onClick();
      return;
    }

    if (link) {
      navigate(link);
    }
  };

  return (
    <button
      type={type}
      className={`primary-btn ${className}`}
      onClick={handleClick}
    >
      {icon && <span>{icon}</span>}
      <span>{name}</span>
    </button>
  );
}

export default PrimaryButton
