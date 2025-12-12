// src/components/ui/sheet.jsx
import React, { createContext, useContext, useState } from "react";

const SheetContext = createContext(null);

export function Sheet({ children }) {
  const [open, setOpen] = useState(false);
  return (
    <SheetContext.Provider value={{ open, setOpen }}>
      {children}
    </SheetContext.Provider>
  );
}

export function SheetTrigger({ asChild = false, children }) {
  const { setOpen } = useContext(SheetContext);

  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children, {
      onClick: (e) => {
        if (children.props.onClick) children.props.onClick(e);
        setOpen(true);
      },
    });
  }

  return <button onClick={() => setOpen(true)}>{children}</button>;
}

export function SheetContent({ side = "left", className = "", children }) {
  const { open, setOpen } = useContext(SheetContext);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50">
      {/* overlay */}
      <div
        className="absolute inset-0 bg-black/40"
        onClick={() => setOpen(false)}
      />
      {/* painel */}
      <div
        className={`absolute top-0 h-full w-64 bg-white shadow-xl ${
          side === "left" ? "left-0" : "right-0"
        } ${className}`}
      >
        {children}
      </div>
    </div>
  );
}
