import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export const SignatureBar = () => (
  <div className="fixed inset-x-0 bottom-4 px-4 flex justify-center pointer-events-none">
    <div className="bg-card/90 backdrop-blur rounded-pill shadow-softer px-4 py-2 flex items-center gap-3 pointer-events-auto">
      <span className="text-sm">Theme loaded: modern, soft, premium.</span>
      <Button asChild variant="chip" size="chip">
        <Link to="/shop">Explore Shop</Link>
      </Button>
    </div>
  </div>
);
