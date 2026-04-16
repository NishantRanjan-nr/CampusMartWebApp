export function getListingId(listing) {
    return listing?._id ?? listing?.id ?? '';
}