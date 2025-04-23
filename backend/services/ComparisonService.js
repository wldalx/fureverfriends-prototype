// type-agnostic mongoose objects comparison
// i.e. regardless of id string, ObjectId, Document, …
export function isSameRef(a, b) {
    return (a?._id ?? a ?? "").toString() == (b?._id ?? b ?? "").toString();
}