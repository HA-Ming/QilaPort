const projects = window.portfolioProjects;
const inProjectDirectory = window.location.pathname.includes("/projects/");
const assetPrefix = inProjectDirectory ? "../assets/images/" : "assets/images/";
const projectPrefix = inProjectDirectory ? "" : "projects/";

const makeEyebrow = (text) => {
  const eyebrow = document.createElement("p");
  eyebrow.className = "eyebrow";
  eyebrow.textContent = text;
  return eyebrow;
};

const makeProjectLink = (project, index, className = "") => {
  const article = document.createElement("article");
  article.className = `project work-project reveal ${index % 2 ? "work-project--offset" : ""} ${className}`.trim();

  const imageLink = document.createElement("a");
  imageLink.className = "project__image image-frame";
  imageLink.href = `${projectPrefix}${project.id}.html`;
  imageLink.dataset.projectId = project.id;
  imageLink.setAttribute("aria-label", `View ${project.title} project`);

  const image = document.createElement("img");
  image.src = `${assetPrefix}${project.image}`;
  image.alt = project.alt;
  image.loading = "lazy";
  image.dataset.scrollImage = "";
  imageLink.append(image);

  const folio = document.createElement("span");
  folio.className = "project__folio";
  folio.setAttribute("aria-hidden", "true");
  folio.textContent = String(index + 1).padStart(2, "0");
  imageLink.append(folio);

  const caption = document.createElement("div");
  caption.className = "project__caption";
  const titleBlock = document.createElement("div");
  const title = document.createElement("h2");
  title.textContent = project.title;
  const meta = document.createElement("p");
  meta.textContent = `${project.category.toUpperCase()} / ${project.location} / ${project.year}`;
  titleBlock.append(title, meta);
  const arrow = document.createElement("span");
  arrow.className = "project__arrow";
  arrow.setAttribute("aria-hidden", "true");
  arrow.textContent = "↗";
  caption.append(titleBlock, arrow);
  article.append(imageLink, caption);
  return article;
};

const renderWorkPage = () => {
  const gallery = document.querySelector("[data-work-gallery]");
  if (!gallery) return;

  const filters = document.querySelector("[data-work-filters]");
  const categories = ["All", ...new Set(projects.map((project) => project.category))];
  categories.forEach((category) => {
    const button = document.createElement("button");
    button.className = "work-filter";
    button.type = "button";
    button.dataset.category = category;
    button.setAttribute("aria-pressed", String(category === "All"));
    button.textContent = category;
    filters?.append(button);
  });

  projects.forEach((project, index) => {
    gallery.append(makeProjectLink(project, index));
  });

  filters?.addEventListener("click", (event) => {
    const button = event.target.closest("[data-category]");
    if (!button) return;
    const category = button.dataset.category;
    filters.querySelectorAll("button").forEach((filter) => {
      filter.setAttribute("aria-pressed", String(filter === button));
    });
    gallery.querySelectorAll(".work-project").forEach((article) => {
      const project = projects.find((item) => item.id === article.querySelector("[data-project-id]")?.dataset.projectId);
      const visible = category === "All" || project?.category === category;
      article.hidden = !visible;
      if (visible && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        article.animate([
          { opacity: 0, transform: "translateY(12px)" },
          { opacity: 1, transform: "translateY(0)" },
        ], { duration: 420, easing: "cubic-bezier(.22, 1, .36, 1)" });
      }
    });
  });
};

const renderProjectPage = () => {
  const mount = document.querySelector("[data-project-detail]");
  if (!mount) return;
  const project = projects.find((item) => item.id === document.body.dataset.projectId);
  if (!project) {
    document.title = "Project unavailable — Aqilah Maisarah";
    const message = document.createElement("p");
    message.textContent = "This project could not be found.";
    mount.append(message);
    return;
  }
  const caseStudy = project.caseStudy ?? {};

  document.title = `${project.title} — Aqilah Maisarah`;
  document.querySelector('meta[name="description"]')?.setAttribute(
    "content",
    `${project.title}, an illustrative ${project.category.toLowerCase()} concept project in ${project.location}.`,
  );

  mount.classList.add("case-study");
  const opening = document.createElement("section");
  opening.className = "case-opening section-pad";
  const backLink = document.createElement("a");
  backLink.className = "text-link case-back";
  backLink.href = "../work.html";
  backLink.append(document.createTextNode("← ALL PROJECTS"));
  opening.append(backLink);

  const heading = document.createElement("div");
  heading.className = "case-heading";
  heading.append(makeEyebrow(`PROJECT / ${String(projects.indexOf(project) + 1).padStart(2, "0")}`));
  const title = document.createElement("h1");
  title.textContent = project.title;
  const descriptor = document.createElement("p");
  descriptor.className = "case-descriptor";
  descriptor.textContent = "ILLUSTRATIVE CONCEPT PROJECT / SUPPLIED LISTING DETAILS";
  const meta = document.createElement("dl");
  meta.className = "case-meta";
  const projectInformation = [
    ["Type", project.category],
    ["Location", project.location],
    ["Year", project.year],
  ];
  if (caseStudy.scope) projectInformation.push(["Scope", caseStudy.scope]);
  projectInformation.forEach(([label, value]) => {
    const item = document.createElement("div");
    const term = document.createElement("dt");
    const definition = document.createElement("dd");
    term.textContent = label;
    definition.textContent = value;
    item.append(term, definition);
    meta.append(item);
  });
  heading.append(title, descriptor, meta);
  opening.append(heading);

  const imageFigure = document.createElement("figure");
  imageFigure.className = "case-image";
  const imageButton = document.createElement("button");
  imageButton.className = "case-image__button";
  imageButton.type = "button";
  imageButton.setAttribute("aria-label", `Enlarge ${project.title} ${project.imageRole.toLowerCase()}`);
  const image = document.createElement("img");
  image.src = `../assets/images/${project.image}`;
  image.alt = project.alt;
  image.fetchPriority = "high";
  imageButton.append(image);
  const caption = document.createElement("figcaption");
  caption.textContent = `${project.imageRole.toUpperCase()} / NOT A PHOTOGRAPH OF A COMPLETED SPACE`;
  imageFigure.append(imageButton, caption);
  opening.append(imageFigure);

  const content = [opening];
  const caseAssets = (field) => Array.isArray(caseStudy[field]) ? caseStudy[field] : [];
  const floorPlanningAssets = [
    ...caseAssets("floorPlans"),
    ...caseAssets("spatialPlanning"),
  ];
  const hasVerifiedPalette = caseStudy.palette?.source === "designer-supplied"
    && Array.isArray(caseStudy.palette.colors)
    && caseStudy.palette.colors.length > 0;

  const makeTemplateSection = (name, label, titleText, slots) => {
    const section = document.createElement("section");
    section.className = `case-template case-template--${name} section-pad`;
    const heading = document.createElement("div");
    heading.className = "case-template__heading";
    heading.append(makeEyebrow(label));
    const title = document.createElement("h2");
    title.textContent = titleText;
    const note = document.createElement("p");
    note.textContent = "Template ready for project-specific content. No source material has been supplied yet.";
    heading.append(title, note);

    const list = document.createElement("ol");
    list.className = "case-template__slots";
    slots.forEach((slot, index) => {
      const item = document.createElement("li");
      const number = document.createElement("span");
      number.className = "case-template__number";
      number.setAttribute("aria-hidden", "true");
      number.textContent = String(index + 1).padStart(2, "0");
      const slotTitle = document.createElement("h3");
      slotTitle.textContent = slot.title;
      const description = document.createElement("p");
      description.textContent = slot.description;
      const status = document.createElement("span");
      status.className = "case-template__status";
      status.textContent = "AWAITING CONTENT";
      item.append(number, slotTitle, description, status);
      list.append(item);
    });
    section.append(heading, list);
    return section;
  };

  const addProseSection = (label, headingText, value, className = "") => {
    if (!value || (Array.isArray(value) && value.length === 0)) return;
    const section = document.createElement("section");
    section.className = `case-prose section-pad ${className}`.trim();
    section.append(makeEyebrow(label));
    const copy = document.createElement("div");
    copy.className = "case-prose__copy";
    if (headingText) {
      const sectionHeading = document.createElement("h2");
      sectionHeading.textContent = headingText;
      copy.append(sectionHeading);
    }
    const paragraphs = Array.isArray(value) ? value : [value];
    paragraphs.filter(Boolean).forEach((paragraph) => {
      const text = document.createElement("p");
      text.textContent = typeof paragraph === "string" ? paragraph : paragraph.text;
      copy.append(text);
    });
    section.append(copy);
    content.push(section);
  };

  addProseSection("PROJECT INTRODUCTION", null, caseStudy.introduction, "case-prose--intro");
  const conceptText = typeof caseStudy.designConcept === "string"
    ? caseStudy.designConcept
    : caseStudy.designConcept?.content;
  addProseSection("DESIGN CONCEPT", null, conceptText, "case-prose--concept");
  addProseSection("DESIGN DIRECTION", null, caseStudy.designDirection, "case-prose--direction");

  let paletteSection = null;
  if (hasVerifiedPalette) {
    const palette = document.createElement("section");
    palette.className = "case-palette section-pad";
    const paletteHeading = document.createElement("div");
    paletteHeading.className = "case-section-heading";
    paletteHeading.append(makeEyebrow("DESIGNER-SUPPLIED COLOUR PALETTE"));
    const paletteTitle = document.createElement("h2");
    paletteTitle.textContent = "Colour and finish.";
    const paletteNote = document.createElement("p");
    paletteNote.textContent = caseStudy.palette.note
      ?? "Project colour selections supplied as part of the design record.";
    paletteHeading.append(paletteTitle, paletteNote);

    const swatches = document.createElement("ol");
    swatches.className = "case-swatches";
    caseStudy.palette.colors.forEach((color) => {
      const item = document.createElement("li");
      item.className = "case-swatch";
      const sample = document.createElement("span");
      sample.className = "case-swatch__color";
      sample.style.setProperty("--swatch-color", color);
      sample.setAttribute("aria-hidden", "true");
      const value = document.createElement("span");
      value.textContent = color;
      item.append(sample, value);
      swatches.append(item);
    });
    palette.append(paletteHeading, swatches);
    paletteSection = palette;
  }

  const moodBoards = caseAssets("moodBoards");
  const referenceImages = caseAssets("referenceImages");
  if (!moodBoards.length && !referenceImages.length) {
    content.push(makeTemplateSection("concept", "CASE STUDY TEMPLATE / 02", "Inspiration & concept development", [
      { title: "Inspiration", description: "Project-specific reference images, sources or notes." },
      { title: "Concept development", description: "Approved concept statement or development material." },
    ]));
  }

  const materialAssets = caseAssets("materials");
  const materialSlots = [];
  if (!materialAssets.length) {
    materialSlots.push({ title: "Material samples", description: "Actual material and finish samples selected for this project." });
  }
  if (!hasVerifiedPalette) {
    materialSlots.push({ title: "Colour palette", description: "Designer-provided colour selections and their references." });
  }

  const mediaSections = [
    ["moodBoards", "CONCEPT & MOOD", "Mood boards"],
    ["referenceImages", "DESIGN REFERENCES", "Reference images"],
    ["materials", "MATERIALS & FINISHES", "Material references"],
    ["sketches", "SKETCHES & DESIGN DEVELOPMENT", "Drawings and sketches"],
    ["floorPlanning", "FLOOR PLAN & SPATIAL PLANNING", "Floor plans and spatial studies"],
    ["furnitureReferences", "FURNITURE REFERENCES", "Furniture references"],
    ["visualisations", "DESIGN VISUALISATIONS", "Visualisations"],
    ["completedPhotography", "COMPLETED SPACE", "Completed-space photography"],
  ];
  mediaSections.forEach(([field, label, headingText]) => {
    const assets = field === "floorPlanning"
      ? floorPlanningAssets
      : caseAssets(field);
    if (!assets.length) {
      if (field === "materials" && materialSlots.length) {
        content.push(makeTemplateSection("materials", "CASE STUDY TEMPLATE / 03", "Material & colour exploration", materialSlots));
      } else if (field === "sketches") {
        content.push(makeTemplateSection("sketches", "CASE STUDY TEMPLATE / 04", "Sketches & design development", [
          { title: "Design sketches", description: "Project sketches, studies or design-development drawings." },
        ]));
      } else if (field === "floorPlanning") {
        content.push(makeTemplateSection("floor-plans", "CASE STUDY TEMPLATE / 04", "Floor plans & spatial planning", [
          { title: "Floor plans", description: "Project floor plans or spatial-planning drawings." },
        ]));
      }
      return;
    }
    const section = document.createElement("section");
    const layout = assets.length === 1 ? "single" : assets.length === 2 ? "pair" : "sequence";
    section.className = `case-gallery case-gallery--${field} case-gallery--${layout} section-pad`;
    const sectionHeading = document.createElement("div");
    sectionHeading.className = "case-section-heading";
    sectionHeading.append(makeEyebrow(label));
    const titleText = document.createElement("h2");
    titleText.textContent = headingText;
    sectionHeading.append(titleText);

    const list = document.createElement("div");
    list.className = "case-gallery__items";
    assets.forEach((asset, index) => {
      const item = typeof asset === "string" ? { src: asset } : asset;
      const figure = document.createElement("figure");
      figure.className = "case-gallery__item";
      const button = document.createElement("button");
      button.className = "case-gallery__button";
      button.type = "button";
      const mediaAlt = item.alt ?? `${project.title} — ${headingText.toLowerCase()} ${index + 1}`;
      button.setAttribute("aria-label", `Enlarge ${mediaAlt}`);
      const media = document.createElement("img");
      media.src = `../assets/images/${item.src}`;
      media.alt = mediaAlt;
      media.loading = "lazy";
      button.append(media);
      figure.append(button);
      if (item.caption) {
        const mediaCaption = document.createElement("figcaption");
        mediaCaption.textContent = item.caption;
        figure.append(mediaCaption);
      }
      list.append(figure);
    });
    section.append(sectionHeading, list);
    content.push(section);
  });

  if (paletteSection) {
    const laterStoryIndex = content.findIndex((section) =>
      section.classList.contains("case-gallery--sketches")
      || section.classList.contains("case-gallery--floorPlanning")
      || section.classList.contains("case-gallery--furnitureReferences")
      || section.classList.contains("case-gallery--visualisations")
      || section.classList.contains("case-gallery--completedPhotography")
      || section.classList.contains("case-template--sketches")
      || section.classList.contains("case-template--floor-plans"));
    content.splice(laterStoryIndex < 0 ? content.length : laterStoryIndex, 0, paletteSection);
  }

  if (!caseAssets("visualisations").length && !caseAssets("completedPhotography").length) {
    content.push(makeTemplateSection("final", "CASE STUDY TEMPLATE / 06", "Final imagery", [
      { title: "Final visualisations", description: "Approved final renders, if available." },
      { title: "Completed photographs", description: "Photography of the finished project, if available." },
    ]));
  }

  const modelSettings = window.portfolioModelViewer;
  if (modelSettings) {
    const modelSection = document.createElement("section");
    modelSection.className = "case-model section-pad";
    modelSection.setAttribute("aria-labelledby", "case-model-title");

    const modelIntro = document.createElement("div");
    modelIntro.className = "case-model__intro";
    modelIntro.append(makeEyebrow("SHARED INTERACTIVE FURNITURE STUDY"));
    const modelTitle = document.createElement("h2");
    modelTitle.id = "case-model-title";
    modelTitle.textContent = "Explore in 3D.";
    const modelDescription = document.createElement("p");
    modelDescription.textContent = "This furniture study is available across the portfolio projects. Drag to rotate and use the wheel or pinch to zoom; the model shows furniture, not a complete interior.";
    modelIntro.append(modelTitle, modelDescription);

    const stage = document.createElement("div");
    stage.className = "case-model__stage";
    const preview = document.createElement("div");
    preview.className = "case-model__preview";
    preview.setAttribute("aria-hidden", "true");
    const previewIndex = document.createElement("span");
    previewIndex.className = "case-model__preview-index";
    previewIndex.textContent = "01 / 01";
    const previewName = document.createElement("span");
    previewName.className = "case-model__preview-name";
    previewName.textContent = "A FURNITURE STUDY";
    preview.append(previewIndex, previewName);

    const modelStatus = document.createElement("div");
    modelStatus.className = "case-model__status";
    modelStatus.setAttribute("role", "status");
    modelStatus.setAttribute("aria-live", "polite");
    modelStatus.hidden = true;

    const modelError = document.createElement("div");
    modelError.className = "case-model__error";
    modelError.setAttribute("role", "alert");
    modelError.hidden = true;

    const modelControls = document.createElement("div");
    modelControls.className = "case-model__controls";
    const resetCamera = document.createElement("button");
    resetCamera.className = "case-model__reset";
    resetCamera.type = "button";
    resetCamera.textContent = "RESET VIEW";
    resetCamera.hidden = true;
    modelControls.append(resetCamera);

    const loadModel = document.createElement("button");
    loadModel.className = "case-model__load";
    loadModel.type = "button";
    loadModel.textContent = "LOAD 3D STUDY";
    const loadHint = document.createElement("p");
    loadHint.className = "case-model__hint";
    loadHint.textContent = "The 3D model loads only when requested.";
    stage.append(preview, modelStatus, modelError, modelControls, loadModel, loadHint);
    modelSection.append(modelIntro, stage);
    const finalImagesIndex = content.findIndex((section) =>
      section.classList.contains("case-gallery--visualisations")
      || section.classList.contains("case-gallery--completedPhotography")
      || section.classList.contains("case-template--final"));
    content.splice(finalImagesIndex < 0 ? content.length : finalImagesIndex, 0, modelSection);

    let modelViewer;
    let libraryPromise;
    let modelLoadTimer;

    const showModelError = (message) => {
      window.clearTimeout(modelLoadTimer);
      modelStatus.hidden = true;
      modelError.replaceChildren();
      const text = document.createElement("p");
      text.textContent = message;
      const retry = document.createElement("button");
      retry.className = "case-model__retry";
      retry.type = "button";
      retry.textContent = "TRY AGAIN";
      retry.addEventListener("click", () => startModelLoad(), { once: true });
      modelError.append(text, retry);
      modelError.hidden = false;
      loadModel.hidden = true;
    };

    const loadModelViewerLibrary = () => {
      if (customElements.get("model-viewer")) return Promise.resolve();
      if (libraryPromise) return libraryPromise;

      libraryPromise = new Promise((resolve, reject) => {
        const script = document.createElement("script");
        script.type = "module";
        script.src = "https://ajax.googleapis.com/ajax/libs/model-viewer/4.1.0/model-viewer.min.js";
        script.addEventListener("load", () => {
          customElements.whenDefined("model-viewer").then(resolve, reject);
        }, { once: true });
        script.addEventListener("error", () => reject(new Error("The model-viewer component could not be loaded.")), { once: true });
        document.head.append(script);
      }).catch((error) => {
        libraryPromise = null;
        throw error;
      });

      return libraryPromise;
    };

    async function startModelLoad() {
      window.clearTimeout(modelLoadTimer);
      modelLoadTimer = window.setTimeout(() => {
        showModelError("The model is taking too long to load. Check your connection and the model file path, then try again.");
      }, 45000);
      loadModel.disabled = true;
      loadModel.hidden = true;
      loadHint.hidden = true;
      modelError.hidden = true;
      modelStatus.textContent = "Loading the 3D viewer…";
      modelStatus.hidden = false;

      try {
        await loadModelViewerLibrary();
        if (!modelViewer) {
          modelViewer = document.createElement("model-viewer");
          modelViewer.className = "case-model__viewer";
          modelViewer.setAttribute("alt", modelSettings.alt);
          modelViewer.setAttribute("camera-controls", "");
          modelViewer.setAttribute("touch-action", "pan-y");
          modelViewer.setAttribute("camera-orbit", modelSettings.cameraOrbit ?? "35deg 75deg auto");
          modelViewer.setAttribute("camera-target", "auto auto auto");
          modelViewer.setAttribute("field-of-view", modelSettings.fieldOfView ?? "30deg");
          modelViewer.setAttribute("environment-image", "neutral");
          modelViewer.setAttribute("exposure", "1");
          modelViewer.setAttribute("shadow-intensity", "0.8");
          modelViewer.setAttribute("interaction-prompt", "auto");
          modelViewer.setAttribute("loading", "eager");
          modelViewer.addEventListener("progress", (event) => {
            const progress = Math.round(event.detail.totalProgress * 100);
            modelStatus.textContent = progress
              ? `Loading the furniture study… ${progress}%`
              : "Preparing the furniture study…";
          });
          modelViewer.addEventListener("load", () => {
            window.clearTimeout(modelLoadTimer);
            modelStatus.hidden = true;
            resetCamera.hidden = false;
          });
          modelViewer.addEventListener("error", () => {
            showModelError("The model could not be loaded. Check the file path assets/models/examp.glb and try again.");
          });
          stage.insertBefore(modelViewer, modelControls);
        }
        if (modelViewer.hasAttribute("src")) modelViewer.removeAttribute("src");
        modelViewer.setAttribute("src", modelSettings.src);
        modelViewer.setAttribute("reveal", "auto");
      } catch {
        showModelError("The 3D viewer could not be loaded. Check your internet connection and try again.");
      } finally {
        loadModel.disabled = false;
      }
    }

    loadModel.addEventListener("click", startModelLoad);
    resetCamera.addEventListener("click", () => {
      if (!modelViewer) return;
      const resetFieldOfView = modelSettings.fieldOfView ?? "30deg";
      modelViewer.removeAttribute("camera-controls");
      modelViewer.setAttribute("min-field-of-view", resetFieldOfView);
      modelViewer.setAttribute("max-field-of-view", resetFieldOfView);
      modelViewer.cameraOrbit = modelSettings.cameraOrbit ?? "35deg 75deg auto";
      modelViewer.cameraTarget = "auto auto auto";
      modelViewer.fieldOfView = resetFieldOfView;
      modelViewer.jumpCameraToGoal();
      window.requestAnimationFrame(() => {
        modelViewer?.removeAttribute("min-field-of-view");
        modelViewer?.removeAttribute("max-field-of-view");
        modelViewer?.setAttribute("camera-controls", "");
      });
    });
  }

  addProseSection("DESIGN SUMMARY", null, caseStudy.summary, "case-prose--summary");

  const availableDocumentation = [
    caseStudy.introduction,
    conceptText,
    caseStudy.designDirection?.length,
    caseStudy.moodBoards?.length,
    caseStudy.referenceImages?.length,
    caseStudy.materials?.length,
    caseStudy.furnitureReferences?.length,
    caseStudy.sketches?.length,
    caseStudy.spatialPlanning?.length,
    caseStudy.floorPlans?.length,
    caseStudy.visualisations?.length,
    caseStudy.completedPhotography?.length,
    caseStudy.summary,
  ].some(Boolean);
  if (!availableDocumentation) {
    const record = document.createElement("section");
    record.className = "case-record section-pad";
    record.append(makeEyebrow("THE PROJECT RECORD"));
    const recordCopy = document.createElement("p");
    recordCopy.textContent = window.portfolioModelViewer
      ? "The available record contains this AI-generated concept image, the listing details above and a separate furniture model—not a complete interior. Aqilah's design statement, project-specific material references, drawings, plans, visualisations and completed-space photographs have not been supplied, so no design rationale or built outcome is inferred here."
      : "The available record contains this AI-generated concept image and the listing details above. Aqilah's design statement, project-specific material references, drawings, plans, visualisations and completed-space photographs have not been supplied, so no design rationale or built outcome is inferred here.";
    record.append(recordCopy);
    content.push(record);
  }

  const navigation = document.createElement("nav");
  navigation.className = "case-navigation section-pad";
  navigation.setAttribute("aria-label", "Project navigation");
  const currentIndex = projects.indexOf(project);
  const previous = projects[(currentIndex - 1 + projects.length) % projects.length];
  const next = projects[(currentIndex + 1) % projects.length];
  const previousLink = document.createElement("a");
  previousLink.href = `${previous.id}.html`;
  const nextLink = document.createElement("a");
  nextLink.href = `${next.id}.html`;
  const previousLabel = document.createElement("span");
  previousLabel.className = "eyebrow";
  previousLabel.textContent = "PREVIOUS PROJECT";
  const previousTitle = document.createElement("span");
  previousTitle.textContent = `${previous.title} ←`;
  const nextLabel = document.createElement("span");
  nextLabel.className = "eyebrow";
  nextLabel.textContent = "NEXT PROJECT";
  const nextTitle = document.createElement("span");
  nextTitle.textContent = `${next.title} →`;
  previousLink.append(previousLabel, previousTitle);
  nextLink.append(nextLabel, nextTitle);
  navigation.append(previousLink, nextLink);
  content.push(navigation);

  const lightbox = document.createElement("dialog");
  lightbox.className = "case-lightbox";
  lightbox.setAttribute("aria-label", `${project.title} image viewer`);
  const closeButton = document.createElement("button");
  closeButton.className = "case-lightbox__close";
  closeButton.type = "button";
  closeButton.setAttribute("aria-label", "Close enlarged image");
  closeButton.textContent = "×";
  const lightboxImage = document.createElement("img");
  lightboxImage.alt = "";
  lightboxImage.hidden = true;
  lightbox.append(closeButton, lightboxImage);
  mount.append(...content, lightbox);

  mount.querySelectorAll(".case-image__button, .case-gallery__button").forEach((button) => {
    button.addEventListener("click", () => {
      const source = button.querySelector("img");
      if (!source) return;
      lightboxImage.src = source.currentSrc || source.src;
      lightboxImage.alt = source.alt;
      lightboxImage.hidden = false;
      lightbox.showModal();
    });
  });
  closeButton.addEventListener("click", () => lightbox.close());
  lightbox.addEventListener("keydown", (event) => {
    if (event.key !== "Escape") return;
    event.preventDefault();
    lightbox.close();
  });
  lightbox.addEventListener("cancel", (event) => {
    event.preventDefault();
    lightbox.close();
  });
  lightbox.addEventListener("close", () => {
    lightboxImage.removeAttribute("src");
    lightboxImage.alt = "";
    lightboxImage.hidden = true;
  });
  lightbox.addEventListener("click", (event) => {
    if (event.target === lightbox) lightbox.close();
  });

  if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    imageFigure.animate([
      { clipPath: "inset(0 0 0 100%)" },
      { clipPath: "inset(0)" },
    ], { duration: 1000, easing: "cubic-bezier(.22, 1, .36, 1)" });
  }
};

renderWorkPage();
renderProjectPage();
