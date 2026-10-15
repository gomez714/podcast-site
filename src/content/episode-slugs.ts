/**
 * Public URL slugs keyed by RSS GUID. Slugs are permanent once published:
 * never derive them from titles at runtime and never rename an existing entry.
 */
export const episodeSlugsByGuid: Readonly<Record<string, string>> = {
  "fbx/4c66fa50-a4f9-11ee-84fb-ba5fa9561315": "ep-1-luis-gomez",
  "fbx/c80ae04c-a790-11ee-b525-ba5fa9561315": "ep-2-razie",
  "fbx/02aa3eae-a819-11ee-b724-ba5fa9561315": "ep-3-simon-guerard",
  "fbx/5ed446f8-adf9-11ee-a087-ba5fa9561315": "ep-4-kate-conwell",
  "fbx/38ebfba6-b2a5-11ee-a489-ba5fa9561315": "ep-5-devin",
  "fbx/7217f19a-b990-11ee-8d88-ba5fa9561315": "ep-6-jurate-wolfe",
  "fbx/aa6b5d92-bf31-11ee-b7ec-ba5fa9561315": "ep-7-alekson",
  "fbx/4f92859e-c5e4-11ee-a9b9-ba5fa9561315": "ep-8-yuko-sasaki",
};
