export enum OfferType {
	PERCENTAGE = "percentage",
	FIXED_AMOUNT = "fixed_amount",
	BUY_ONE_GET_ONE = "buy_one_get_one",
	FREE_ITEM = "free_item"
}

export interface Offer {
	id: string;
	title: string;
	description: string;
	slug: string;
	coverImage: string;
	discountType: OfferType;
	discountValue: number;
	currency: string;
	merchant: {
		id: string;
		name: string;
		logo: string;
		website: string;
		approved: boolean;
	};
	coupons: {
		total: number;
		claimed: number;
		redeemed: number;
	}
	status: string;
	startDate: Date;
	endDate: Date;
	termsAndConditions: string;
}