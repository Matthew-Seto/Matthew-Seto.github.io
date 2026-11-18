/* ==========================================================================
   SITE CONTENT — edit this file to update the portfolio.
   Everything marked PLACEHOLDER is safe to replace.
   ========================================================================== */

window.SITE = {
  name: "Matthew Seto",
  city: "Toronto, CA",            // PLACEHOLDER
  timeZone: "America/Toronto",   // IANA time zone, e.g. America/Toronto, America/Vancouver
  bio: [
    // Words wrapped in *asterisks* render in solid black, the rest in grey.
    "*UGC creator* making short-form content that feels native to the feed —",
    "*built to stop the scroll* and move people to buy.",
  ],
  available: "Available", // PLACEHOLDER
  email: "matthewseto2004@gmail.com",               // PLACEHOLDER
  socials: [
    { label: "TikTok", url: "https://www.tiktok.com/@poseref" },             // PLACEHOLDER
    { label: "Instagram", url: "https://www.instagram.com/_matthewseto/" },
  ],
  stats: [
    { value: 4.4, decimals: 1, suffix: "M+", label: "Organic views generated" }, // PLACEHOLDER
    { value: 3, decimals: 0, suffix: "+", label: "Brands partnered with" },      // PLACEHOLDER
    { value: 6.8, decimals: 1, suffix: "%", label: "Average engagement rate" },   // PLACEHOLDER
    { value: 140, decimals: 0, suffix: "+", label: "Videos delivered" },          // PLACEHOLDER
  ],
  brands: [
    // PLACEHOLDER brand names — swap for real clients (or logos later)
    "Gizmo", "Supabase", "PoseRef"
  ],
  services: [
    {
      title: "UGC Videos",
      body: "Authentic, creator-style videos for paid social. Hooks, voiceover, b-roll and on-screen text — delivered raw or edited.",
      tags: ["TikTok", "Reels", "Shorts"],
    },
    {
      title: "Ad Creative Iterations",
      body: "Multiple hooks and CTAs per concept so your team can A/B test and scale the winners fast.",
      tags: ["Hooks", "Variations", "Whitelisting"],
    },
  ],
};

/* --------------------------------------------------------------------------
   FEED ITEMS
   - category:  used by the filter chips (keep these consistent)
   - aspect:    "9/16" (vertical), "4/3", "16/9", "4/5" or "1/1"
   - instagram: reel shortcode — the part after /reel/ in the link.
                Clicking the card plays the reel via Instagram's embed.
   - poster:    cover image shown on the card (saved in assets/ig/)
   - handle:    Instagram account it was posted on
   - views:     view count shown on the card and in the popup
   - video:     path/URL to your own .mp4 instead (optional, plays on hover)
   - tones:     two colours for placeholder art when there is no media
   -------------------------------------------------------------------------- */
const ig = (instagram, handle, category, title, views, date, aspect = "9/16") =>
  ({ instagram, handle, category, title, views, date, aspect, platform: "Instagram", brand: handle, poster: `assets/ig/${instagram}.jpg` });

window.FEED = [
  ig("DcwErnARh9X", "joinposeref", "Tech", "Why didn't I know about this sooner", "1.4M", "September 2026"),
  ig("DP9OQOjEXFZ", "_matthewseto", "Lifestyle", "Jirisan National Park", "2,664", "October 2025", "4/3"),
  ig("DfGWvfWNPEX", "matt.guides", "Study", "Studying vs. reality", "2,256", "October 2026"),
  ig("DcB7l-Eh_L4", "joinposeref", "Tech", "My cameraman loves this app", "547K", "August 2026"),
  ig("DfyLyQqNI_M", "mattsset", "Tech", "This is all you need to build", "406", "November 2026"),
  ig("DPYvHgmET5n", "_matthewseto", "Lifestyle", "Bye for now, Japan", "2,525", "October 2025", "4/3"),
  ig("DczkFP6xNzd", "joinposeref", "Tech", "Photos are so simple", "336K", "September 2026"),
  ig("DfN-oH5tsgu", "matt.guides", "Study", "Unpatched ways to keep a 4.0 GPA", "2,033", "November 2026"),
  ig("DTs4u2akwYY", "_matthewseto", "Lifestyle", "City walk", "2,149", "January 2026", "4/3"),
  ig("DZ2wwqWxMbA", "joinposeref", "Tech", "Poses made so easy", "269K", "June 2026"),
  ig("DfpjCMEgdFZ", "mattsset", "Tech", "40,000 downloads in 6 months", "335", "November 2026"),
  ig("DfQYHEutw5a", "matt.guides", "Study", "These are not worth it in school", "1,980", "November 2026"),
  ig("DeewaxrxMfS", "joinposeref", "Tech", "It's this easy to take photos", "192K", "October 2026"),
  ig("DOppsbJEfz_", "_matthewseto", "Lifestyle", "Canada to Japan", "2,123", "September 2025", "4/3"),
  ig("DfXyNd7t1Y2", "matt.guides", "Study", "GPA killers to avoid", "1,958", "November 2026"),
  ig("DcrrwVcR2P9", "joinposeref", "Tech", "Poses made so easy, pt. 2", "188K", "August 2026"),
  ig("Dfkrlbdg9fG", "mattsset", "Tech", "Building my app", "272", "November 2026"),
  ig("DZT8AQytbOx", "_matthewseto", "Lifestyle", "Street walk", "1,824", "June 2026", "16/9"),
];
