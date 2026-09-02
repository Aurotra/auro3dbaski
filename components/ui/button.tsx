import Link from "next/link";
import { cn } from "@/lib/cn";

type Common = {
  children: React.ReactNode;
  className?: string;
  variant?: "solid" | "outline" | "ghost";
};

type LinkProps = Common & {
  href: string;
};

type BtnProps = Common &
  React.ButtonHTMLAttributes<HTMLButtonElement> & {
    href?: undefined;
  };

export function Button(props: LinkProps | BtnProps) {
  const { children, className, variant = "solid" } = props;
  const styles = cn(
    "inline-flex items-center justify-center rounded-md px-4 py-2.5 font-display text-sm font-semibold tracking-tight transition-all duration-200",
    variant === "solid" && "btn-glow shadow-[0_0_24px_color-mix(in_srgb,#22d3ee_35%,transparent)] hover:brightness-110",
    variant === "outline" &&
      "border border-accent/50 text-text hover:border-accent-2 hover:text-accent-2",
    variant === "ghost" && "text-text hover:text-accent",
    className,
  );

  if ("href" in props && props.href) {
    const external = props.href.startsWith("http");
    return (
      <Link
        href={props.href}
        className={styles}
        {...(external
          ? { target: "_blank", rel: "noopener noreferrer" }
          : {})}
      >
        {children}
      </Link>
    );
  }

  const buttonProps = props as BtnProps;
  return (
    <button
      type={buttonProps.type ?? "button"}
      className={styles}
      disabled={buttonProps.disabled}
      onClick={buttonProps.onClick}
    >
      {children}
    </button>
  );
}
