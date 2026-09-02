import { IdeaForm } from "@/components/forms/idea-form";
import { VideoGallery } from "@/components/content/video-gallery";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({
  title: "İçerikler",
  description: "Video serileri — Bambu Studio, MakerWorld, ev çözümleri.",
  path: "/icerikler",
});

export default function IceriklerPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-14">
      <h1 className="border-l-4 border-accent pl-4 font-display text-4xl text-text">
        İçerikler
      </h1>
      <p className="mt-3 max-w-xl text-muted">
        Seriye göre süz, platformda izle. İzlenme orada birikir.
      </p>
      <div className="mt-8">
        <VideoGallery />
      </div>
      <section className="mt-16">
        <h2 className="border-l-4 border-accent pl-4 font-display text-2xl text-text">
          Bir sonraki videoda ne test edelim?
        </h2>
        <IdeaForm />
      </section>
    </div>
  );
}
