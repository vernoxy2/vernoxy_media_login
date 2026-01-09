import { Toaster as Sonner } from "sonner";

const Toaster = ({ ...props }) => {
  return (
    <div style={{ position: 'fixed', top: 0, right: 0, zIndex: 9999, pointerEvents: 'none' }}>
      <Sonner
        position="top-right"
        offset="16px"
        toastOptions={{
          classNames: {
            toast:
              "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg",
            description: "group-[.toast]:text-muted-foreground",
            actionButton: "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
            cancelButton: "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
          },
          style: {
            pointerEvents: 'auto',
          }
        }}
        {...props}
      />
    </div>
  );
};

export { Toaster };