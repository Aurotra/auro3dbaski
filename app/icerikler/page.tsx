import { IdeaForm } from "@/components/forms/idea-form";
import { VideoGallery } from "@/components/content/video-gallery";
import { getInstagramVideos } from "@/lib/instagram-videos";
import { pageMeta } from "@/lib/seo";

export const revalidate = 3600;

export const metadata = pageMeta({
  title: "İçerikler",
  description: "Instagram Reels — en çok izlenenler ve seriler.",
  path: "/icerikler",
});

export default async function IceriklerPage() {
  const videos = await getInstagramVideos();
  return (
    <div className="mx-auto max-w-6xl px-4 py-14">
      <h1 className="border-l-4 border-accent pl-4 font-display text-4xl text-text">
        İçerikler
      </h1>
      <p className="mt-3 max-w-xl text-muted">
        En çok izlenen Instagram Reels. Tamamı Instagram’da birikir.
      </p>
      <div className="mt-8">
        <VideoGallery videos={videos} />
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
