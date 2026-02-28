const client = window.supabase.createClient(
  window.SUPABASE_URL,
  window.SUPABASE_ANON_KEY
);


const heroBg = document.getElementById("heroBg");


const step1 = document.getElementById("step1");
const step2 = document.getElementById("step2");
const backBtn = document.getElementById("backBtn");


const progressFill = document.getElementById("progressFill");
const progressLabel = document.getElementById("progressLabel");


const form = document.getElementById("leadForm");
const message = document.getElementById("message");
const submitBtn = form.querySelector('button[type="submit"]');


const maisonHidden = document.getElementById("maison_individuelle");


/**
 * Photos PV (vraies photos photovoltaïque)
 * Remplace-les quand tu veux par tes propres images.
 */
const SCENES = {
  maison:
    "https://images.unsplash.com/photo-1509395176047-4a66953fd231?auto=format&fit=crop&w=2400&q=80",
  appartement:
    "https://images.unsplash.com/photo-1548611716-8f9d3c2f4f2d?auto=format&fit=crop&w=2400&q=80",
};


function setScene(scene) {
  heroBg.style.backgroundImage = `url("${SCENES[scene]}")`;
}


function setStep(n) {
  if (n === 1) {
    step1.classList.add("step--active");
    step2.classList.remove("step--active");
    progressFill.style.width = "50%";
    progressLabel.innerText = "Étape 1 / 2";
    showMsg("", "#fff");
  } else {
    step1.classList.remove("step--active");
    step2.classList.add("step--active");
    progressFill.style.width = "100%";
    progressLabel.innerText = "Étape 2 / 2";
  }
}


function showMsg(text, color) {
  message.innerText = text || "";
  message.style.color = color || "#fff";
}


function clean(v) {
  return (v ?? "").toString().trim();
}


// init
setScene("maison");
setStep(1);


document.querySelectorAll("[data-choice]").forEach((btnChoice) => {
  btnChoice.addEventListener("click", () => {
    const val = btnChoice.getAttribute("data-choice"); // maison/appartement


    setScene(val);


    // maison=true / appartement=false
    maisonHidden.value = val === "maison" ? "true" : "false";


    setStep(2);


    setTimeout(() => {
      const first = form.querySelector('input[name="nom"]');
      if (first) first.focus();
    }, 60);
  });
});


backBtn.addEventListener("click", () => setStep(1));


form.addEventListener("submit", async (e) => {
  e.preventDefault();


  submitBtn.disabled = true;
  submitBtn.style.opacity = "0.88";
  showMsg("Envoi…", "rgba(255,255,255,.85)");


  const fd = new FormData(form);


  const payload = {
    nom: clean(fd.get("nom")),
    telephone: clean(fd.get("telephone")),
    code_postal: clean(fd.get("code_postal")),
    facture: clean(fd.get("facture")),
    proprietaire: !!fd.get("proprietaire"),
    maison_individuelle: (clean(fd.get("maison_individuelle")) === "true"),
  };


  if (!payload.nom || !payload.telephone || !payload.code_postal || !payload.facture) {
    showMsg("Complète les champs.", "#ffd1d1");
    submitBtn.disabled = false;
    submitBtn.style.opacity = "1";
    return;
  }


  if (!payload.proprietaire) {
    showMsg("Réservé aux propriétaires.", "#ffd1d1");
    submitBtn.disabled = false;
    submitBtn.style.opacity = "1";
    return;
  }


  const { error } = await client.from("leads").insert([payload]);


  if (error) {
    console.error(error);
    showMsg("Erreur : " + (error.message || "envoi impossible"), "#ffd1d1");
    submitBtn.disabled = false;
    submitBtn.style.opacity = "1";
    return;
  }


  showMsg("✅ Envoyé. On vous rappelle rapidement.", "#b7f7d2");
  form.reset();


  submitBtn.disabled = false;
  submitBtn.style.opacity = "1";

  setTimeout(() => setStep(1), 900);

// =========================
// Compteurs animés au scroll
// =========================
(function(){
  const els = Array.from(document.querySelectorAll("[data-count]"));
  if(!els.length) return;


  let started = false;


  function animateValue(el, to, suffix){
    const duration = 900;
    const start = 0;
    const t0 = performance.now();


    function step(now){
      const p = Math.min(1, (now - t0) / duration);
      const val = Math.round(start + (to - start) * (p < 1 ? (1 - Math.pow(1-p,3)) : 1)); // easeOutCubic
      el.textContent = `${val}${suffix || ""}`;
      if(p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }


  const io = new IntersectionObserver((entries)=>{
    entries.forEach(e=>{
      if(e.isIntersecting && !started){
        started = true;
        els.forEach(el=>{
          const to = Number(el.getAttribute("data-count") || "0");
          const suffix = el.getAttribute("data-suffix") || "";
          animateValue(el, to, suffix);
        });
        io.disconnect();
      }
    });
  }, { threshold: 0.35 });


  io.observe(els[0]);
})();

});
