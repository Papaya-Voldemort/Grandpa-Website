export type CategoryInfo = {
  slug: string;
  label: string;
  headerImage: string;
  intro: string;
};

export const categories: CategoryInfo[] = [
  {
    slug: "inspirational-stories",
    label: "Inspirational Stories",
    headerImage: "/images/header-inspirational.jpg",
    intro: "Stories about prayer, faith, and everyday miracles.",
  },
  {
    slug: "marriage-family",
    label: "Marriage & Family",
    headerImage: "/images/header-marriageandfamily.jpg",
    intro: "Marriage, parenting, and family lessons shaped by faith.",
  },
  {
    slug: "gospel-doctrine",
    label: "Gospel Doctrine",
    headerImage: "/images/header-ark2.jpg",
    intro: "Talks, study guides, and gospel-centered teaching material.",
  },
  {
    slug: "financial-ark",
    label: "Financial Ark",
    headerImage: "/images/header-ark.jpg",
    intro: "Stories and lessons about money, stewardship, and wisdom.",
  },
  {
    slug: "religion-society",
    label: "Religion & Society",
    headerImage: "/images/header-religionandsociety.jpg",
    intro: "Reflections on culture, faith, and the public life of belief.",
  },
  {
    slug: "reading",
    label: "Reading",
    headerImage: "/images/header-reading.jpg",
    intro: "Books, excerpts, and reading selections worth keeping.",
  },
  {
    slug: "my-book",
    label: "My Book",
    headerImage: "/images/header-miracle.jpg",
    intro: "Prayers That Bring Miracles and related material.",
  },
];

export function getCategoryInfo(slug: string) {
  if (slug.includes("/")) {
    const [head, ...rest] = slug.split("/").filter(Boolean);
    const base = categories.find((category) => category.slug === head);
    if (base) {
      const tail = rest
        .map((segment) =>
          segment
            .split("-")
            .filter(Boolean)
            .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
            .join(" "),
        )
        .join(" / ");

      return {
        slug,
        label: tail ? `${base.label} / ${tail}` : base.label,
        headerImage: base.headerImage,
        intro: base.intro,
      };
    }
  }

  return (
    categories.find((category) => category.slug === slug) ?? {
      slug,
      label: slug
        .split("-")
        .filter(Boolean)
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(" "),
      headerImage: "/images/header.jpg",
      intro: "Legacy content from the site archive.",
    }
  );
}
