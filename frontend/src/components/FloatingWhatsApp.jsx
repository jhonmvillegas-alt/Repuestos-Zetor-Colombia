import React from "react";
import { MessageCircle } from "lucide-react";
import { generalWhatsAppMessage } from "../lib/whatsapp";

export default function FloatingWhatsApp() {
  const handleClick = () => {
    if (window.gtag) {
      window.gtag('event', 'whatsapp_click', {
        event_category: 'lead',
        event_label: 'floating_button',
      });
    }
  };

  return (
    
      href={generalWhatsAppMessage()}
      target="_blank"
      rel="noopener noreferrer"
      onClick={handleClick}
      className="fixed bottom-5 right-5 z-50 wa-pulse bg-whatsapp hover:bg-[#1EBE5A] text-white h-14 w-14 sm:h-16 sm:w-16 rounded-full grid place-items-center shadow-2xl"
      aria-label="Cotizar por WhatsApp"
      data-testid="floating-whatsapp-btn"
    >
      <MessageCircle className="h-7 w-7 sm:h-8 sm:w-8" />
    </a>
  );
}
