const photos = [
  { src: "green-pond.jpg", en: "Green pond", zh: "绿潭", tags: ["landscapes", "china"] },
  { src: "riverside-maple.jpg", en: "Maples by the water", zh: "水边枫影", tags: ["landscapes", "china"] },
  { src: "temple-crowd.jpg", en: "Temple crowd", zh: "寺前人潮", tags: ["architecture", "china"] },
  { src: "canal-street.jpg", en: "Canal street", zh: "河道边的街", tags: ["architecture", "china"] },
  { src: "incense-fire.jpg", en: "Fire and incense", zh: "火与香", tags: ["china"] },
  { src: "pink-magnolia.jpg", en: "Pink magnolia", zh: "粉色玉兰", tags: ["landscapes", "china"] },
  { src: "stone-statues.jpg", en: "Stone figures in shadow", zh: "光影里的石像", tags: ["architecture", "china"] },
  { src: "blossom-courtyard.jpg", en: "Magnolia in a courtyard", zh: "庭院里的玉兰", tags: ["architecture", "china"] },
  { src: "plane-tree.jpg", en: "Plane tree and old roof", zh: "梧桐与旧屋檐", tags: ["architecture", "china"] },
  { src: "lingyin-pavilion.jpg", en: "Pavilion in green", zh: "绿意里的亭", tags: ["landscapes", "architecture", "china"] },
  { src: "stone-buddhas.jpg", en: "Stone Buddhas in shade", zh: "树影中的石佛", tags: ["architecture", "china"] },
  { src: "water-study.jpg", en: "Water study", zh: "水的习作", tags: ["landscapes"] },
  { src: "lake-hill.jpg", en: "A hill meeting the lake", zh: "山与湖相遇", tags: ["landscapes", "china"] },
  { src: "jewel.jpg", en: "Waterfall inside the glass", zh: "玻璃穹顶下的瀑布", tags: ["architecture"] },
  { src: "canopy.jpg", en: "Looking up", zh: "向上看", tags: ["landscapes", "architecture", "china"] },
  { src: "magnolia-light.jpg", en: "Magnolia and afternoon light", zh: "玉兰与午后光线", tags: ["landscapes", "architecture", "china"] },
  { src: "blue-sky.jpg", en: "Blue sky, bare branches", zh: "蓝天与枝桠", tags: ["landscapes", "china"] },
  { src: "camellias.jpg", en: "Camellias by the roof", zh: "屋檐边的山茶", tags: ["landscapes", "architecture", "china"] },
  { src: "koi.jpg", en: "Koi and reflections", zh: "锦鲤与倒影", tags: ["animals", "china"] },
  { src: "temple-fire.jpg", en: "Incense and flame", zh: "香火", tags: ["china"] },
  { src: "bamboo-forest.jpg", en: "Bamboo forest", zh: "竹林", tags: ["landscapes", "china"] },
  { src: "winter-branches.jpg", en: "Winter branches", zh: "冬枝", tags: ["landscapes", "architecture", "china"] },
  { src: "bamboo-detail.jpg", en: "Bamboo detail", zh: "竹林细节", tags: ["landscapes", "china"] },
  { src: "plum-reflection.jpg", en: "Plum blossom after rain", zh: "雨后的梅", tags: ["landscapes", "china"] },
  { src: "moon-bridge.jpg", en: "Moon bridge", zh: "月亮桥", tags: ["landscapes", "architecture", "china"] },
  { src: "portrait.jpg", en: "Portrait in an old town", zh: "旧城肖像", tags: ["portraits", "china"] }
];

const gallery = document.querySelector("#gallery");
const lightbox = document.querySelector("#lightbox");
let language = "en";
let activeFilter = "all";
let lastImageTrigger = null;
try { language = localStorage.getItem("taian-language") === "zh" ? "zh" : "en"; } catch {}

function renderGallery() {
  if (!gallery) return;
  const visible = activeFilter === "all" ? photos : photos.filter(photo => photo.tags.includes(activeFilter));
  gallery.replaceChildren(...visible.map(photo => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "gallery-item";
    button.setAttribute("aria-label", (language === "en" ? "View: " : "查看：") + photo[language]);
    const img = document.createElement("img");
    img.src = "assets/images/" + photo.src;
    img.alt = photo[language];
    img.loading = "lazy";
    img.decoding = "async";
    button.append(img);
    button.addEventListener("click", () => {
      lastImageTrigger = button;
      const full = lightbox.querySelector("img");
      full.src = img.src;
      full.alt = img.alt;
      lightbox.showModal();
    });
    return button;
  }));
}

function setLanguage(nextLanguage) {
  language = nextLanguage;
  document.body.classList.toggle("is-zh", language === "zh");
  document.documentElement.lang = language === "zh" ? "zh-CN" : "en";
  document.querySelectorAll("[data-en]").forEach(element => {
    element.textContent = element.dataset[language];
  });
  const toggle = document.querySelector(".language-toggle");
  toggle.textContent = language === "en" ? "中文" : "EN";
  toggle.setAttribute("aria-label", language === "en" ? "Switch to Chinese" : "Switch to English");
  document.querySelector(".lightbox-close")?.setAttribute("aria-label", language === "en" ? "Close" : "关闭");
  try { localStorage.setItem("taian-language", language); } catch {}
  renderGallery();
}

document.querySelector(".language-toggle").addEventListener("click", () => setLanguage(language === "en" ? "zh" : "en"));
document.querySelectorAll(".filter").forEach(button => {
  button.addEventListener("click", () => {
    activeFilter = button.dataset.filter;
    document.querySelectorAll(".filter").forEach(filter => {
      const active = filter === button;
      filter.classList.toggle("active", active);
      filter.setAttribute("aria-pressed", String(active));
    });
    renderGallery();
  });
});
if (lightbox) {
  lightbox.querySelector(".lightbox-close").addEventListener("click", () => lightbox.close());
  lightbox.addEventListener("click", event => { if (event.target === lightbox) lightbox.close(); });
  lightbox.addEventListener("close", () => lastImageTrigger?.focus());
}
document.querySelector("#year").textContent = new Date().getFullYear();
setLanguage(language);

