export enum OfferType {
	PERCENTAGE = "percentage",
	FIXED_AMOUNT = "fixed_amount",
	BUY_ONE_GET_ONE = "buy_one_get_one",
	FREE_ITEM = "free_item"
}

/** What a student gets when they claim: a discount code, or access to an event. */
export enum OfferKind {
	DISCOUNT = "discount",
	EVENT = "event"
}

export enum UsageType {
	SINGLE_USE = "single_use",
	MULTI_USE = "multi_use",
	UNLIMITED = "unlimited",
	TIERED = "tiered"
}

export interface Offer {
	id: string;
	title: string;
	description: string;
	slug: string;
	coverImage: string;
	offerKind?: OfferKind;
	/** Where the event happens. Event offers only. */
	eventUrl?: string;
	discountType: OfferType;
	discountValue: number;
	currency: string;
	redemptionType?: string;
	couponLimit?: number;
	claimed?: number;
	redeemed?: number;
	views?: number;
	revenue?: number;
	category?: {
		id: string;
		name: string;
	} | null;
	merchant: {
		id: string;
		name: string;
		logo: string;
		website?: string;
		approved?: boolean;
	};
	coupons?: {
		total: number;
		claimed: number;
		redeemed: number;
	}
	usage_type?: UsageType;
	max_claims_per_user?: number;
	cooldown_period_hours?: number;
	status: string;
	startDate: Date;
	endDate: Date;
	termsAndConditions: string;
}

/** A merchant an admin can act on behalf of. */
export interface MerchantOption {
	id: string;
	name: string;
	logo?: string;
	category?: string;
	approved?: boolean;
}
