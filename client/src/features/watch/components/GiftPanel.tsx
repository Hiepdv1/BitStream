import React, { memo } from "react";
import { X, Flame, Heart, Star, Rocket, Crown, Diamond } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface GiftType {
  id: string;
  name: string;
  price: number;
  icon: React.ReactNode;
  description: string;
}

const GIFTS: GiftType[] = [
  {
    id: "fire",
    name: "Fire",
    price: 5,
    icon: <Flame className="w-6 h-6 text-orange-500" />,
    description: "Send fire to hype up the stream.",
  },
  {
    id: "heart",
    name: "Heart",
    price: 10,
    icon: <Heart className="w-6 h-6 text-red-500 fill-red-500" />,
    description: "Send some love to the creator.",
  },
  {
    id: "star",
    name: "Star",
    price: 20,
    icon: <Star className="w-6 h-6 text-yellow-400 fill-yellow-400" />,
    description: "You're a star!",
  },
  {
    id: "rocket",
    name: "Rocket",
    price: 50,
    icon: <Rocket className="w-6 h-6 text-purple-500 fill-purple-500/50" />,
    description: "Send a rocket to support the streamer.",
  },
  {
    id: "crown",
    name: "Crown",
    price: 100,
    icon: <Crown className="w-6 h-6 text-yellow-500" />,
    description: "Treat the streamer like a king.",
  },
  {
    id: "diamond",
    name: "Diamond",
    price: 500,
    icon: <Diamond className="w-6 h-6 text-cyan-400 fill-cyan-400/50" />,
    description: "The ultimate show of support.",
  },
];

interface GiftPanelProps {
  onClose: () => void;
  onSend: (giftId: string) => void;
  selectedGiftId?: string | null;
  onSelectGift: (giftId: string) => void;
}

const GiftPanel = ({
  onClose,
  onSend,
  selectedGiftId,
  onSelectGift,
}: GiftPanelProps) => {
  const selectedGift = GIFTS.find((g) => g.id === selectedGiftId) || GIFTS[3];

  return (
    <div className="gift-panel-container animate-in slide-in-from-bottom-4 duration-300">
      <div className="gift-panel-header">
        <div className="flex items-center gap-2">
          <span className="gift-panel-title">SEND A GIFT</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="gift-coin-balance">
            <span className="coin-icon">⛃</span>
            <span className="coin-amount">120 Coins</span>
          </div>
          <button className="buy-coins-btn">Buy Coins</button>
          <button
            onClick={onClose}
            className="gift-close-btn"
            aria-label="Close gift panel"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="gift-grid">
        {GIFTS.map((gift) => (
          <button
            key={gift.id}
            className={`gift-item ${selectedGift?.id === gift.id ? "selected" : ""}`}
            onClick={() => onSelectGift(gift.id)}
          >
            <div className="gift-item-icon">{gift.icon}</div>
            <div className="gift-item-price">{gift.price}</div>
          </button>
        ))}
        {/* Placeholder empty slots to match the design grid */}
        <div className="gift-item empty"></div>
        <div className="gift-item empty"></div>
      </div>

      {selectedGift && (
        <div className="gift-panel-footer">
          <p className="gift-description">
            <strong>{selectedGift.name}</strong> {selectedGift.icon} -{" "}
            {selectedGift.description} <br />
            Cost: {selectedGift.price} coins
          </p>
          <Button
            variant="primary"
            className="w-full mt-3 font-bold py-2 text-white text-base rounded-md"
            onClick={() => onSend(selectedGift.id)}
          >
            Send Gift
          </Button>
        </div>
      )}
    </div>
  );
};

export default memo(GiftPanel);
