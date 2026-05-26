"use client";

import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Camera, Upload, X, Calendar, Eye } from "lucide-react";
import { useDropzone } from "react-dropzone";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { toast } from "sonner";
import { Header } from "@/components/layout/Header";
import { PageHeader } from "@/components/shared/PageHeader";
import { EmptyState } from "@/components/shared/EmptyState";
import type { ProgressPhoto } from "@/types";

const MOCK_PHOTOS: ProgressPhoto[] = [
  { id: "ph1", user_id: "u1", image_url: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=600&fit=crop", note: "J-0 — Début programme", created_at: "2024-01-15T07:00:00Z" },
  { id: "ph2", user_id: "u1", image_url: "https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=400&h=600&fit=crop", note: "Semaine 3", created_at: "2024-02-05T07:00:00Z" },
  { id: "ph3", user_id: "u1", image_url: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400&h=600&fit=crop", note: "Semaine 5 — +3.5kg", created_at: "2024-02-19T07:00:00Z" },
];

export default function PhotosPage() {
  const [photos, setPhotos] = useState<ProgressPhoto[]>(MOCK_PHOTOS);
  const [selected, setSelected] = useState<ProgressPhoto | null>(null);
  const [compareMode, setCompareMode] = useState(false);
  const [comparePhotos, setComparePhotos] = useState<[ProgressPhoto | null, ProgressPhoto | null]>([null, null]);

  const onDrop = useCallback((files: File[]) => {
    files.forEach(file => {
      const url = URL.createObjectURL(file);
      const newPhoto: ProgressPhoto = {
        id: `ph${Date.now()}`,
        user_id: "mock-user-1",
        image_url: url,
        note: "",
        created_at: new Date().toISOString(),
      };
      setPhotos(prev => [...prev, newPhoto]);
      toast.success("Photo ajoutée !");
    });
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [] },
    multiple: true,
  });

  function toggleCompare(photo: ProgressPhoto) {
    if (!compareMode) return;
    setComparePhotos(prev => {
      if (!prev[0]) return [photo, null];
      if (!prev[1] && prev[0].id !== photo.id) return [prev[0], photo];
      return [photo, null];
    });
  }

  return (
    <div className="flex-1">
      <Header title="Photos" subtitle="Ta progression visuelle" />

      <div className="px-4 lg:px-6 py-5 max-w-4xl space-y-5">
        <PageHeader
          title="Photos progression"
          icon={Camera}
          action={
            <button
              onClick={() => setCompareMode(!compareMode)}
              className={`px-4 py-2 rounded-xl text-sm font-medium border transition-all ${
                compareMode
                  ? "bg-brand-700/20 border-brand-700/40 text-brand-700"
                  : "bg-secondary border-border text-muted-foreground hover:text-foreground"
              }`}
            >
              {compareMode ? "Annuler" : "Comparer"}
            </button>
          }
        />

        {compareMode && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-3.5 bg-brand-700/10 border border-brand-700/20 rounded-xl text-sm text-brand-400"
          >
            Sélectionne 2 photos pour les comparer — {comparePhotos.filter(Boolean).length}/2 sélectionnées
          </motion.div>
        )}

        {/* Compare view */}
        {compareMode && comparePhotos[0] && comparePhotos[1] && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-2 gap-3"
          >
            {comparePhotos.map((photo, i) => photo && (
              <div key={i} className="relative aspect-[3/4] rounded-2xl overflow-hidden border border-border">
                <img src={photo.image_url} alt="" className="w-full h-full object-cover" />
                <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 to-transparent p-3">
                  <p className="text-white text-xs font-medium">{photo.note}</p>
                  <p className="text-white/60 text-xs">{format(new Date(photo.created_at), "dd MMM yyyy", { locale: fr })}</p>
                </div>
                <div className="absolute top-2 left-2 px-2 py-1 bg-black/60 rounded-lg text-white text-xs font-bold">
                  {i === 0 ? "Avant" : "Après"}
                </div>
              </div>
            ))}
          </motion.div>
        )}

        {/* Upload zone */}
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-2xl p-6 text-center transition-all cursor-pointer ${
            isDragActive ? "border-brand-700 bg-brand-700/10" : "border-border hover:border-brand-700/50 hover:bg-secondary/30"
          }`}
        >
          <input {...getInputProps()} />
          <div className="w-12 h-12 rounded-2xl bg-secondary flex items-center justify-center mx-auto mb-3">
            <Upload className="w-5 h-5 text-muted-foreground" />
          </div>
          <p className="text-sm font-medium">{isDragActive ? "Dépose ici !" : "Ajouter une photo"}</p>
          <p className="text-xs text-muted-foreground mt-1">Glisse ou clique pour uploader</p>
        </div>

        {/* Photos grid */}
        {photos.length === 0 ? (
          <EmptyState
            icon={Camera}
            title="Aucune photo"
            description="Ajoute ta première photo de progression pour visualiser ta transformation."
          />
        ) : (
          <div>
            <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
              {photos.length} photo{photos.length > 1 ? "s" : ""}
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {photos.map((photo, i) => {
                const isSelected = compareMode && comparePhotos.some(p => p?.id === photo.id);
                return (
                  <motion.div
                    key={photo.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.05 }}
                    className="relative group"
                  >
                    <div
                      onClick={() => compareMode ? toggleCompare(photo) : setSelected(photo)}
                      className={`relative aspect-[3/4] rounded-2xl overflow-hidden border-2 cursor-pointer transition-all ${
                        isSelected ? "border-brand-700 ring-2 ring-brand-700/30" : "border-border/30 hover:border-brand-700/40"
                      }`}
                    >
                      <img src={photo.image_url} alt="" className="w-full h-full object-cover transition-transform group-hover:scale-105" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                      <div className="absolute bottom-0 inset-x-0 p-3 translate-y-2 group-hover:translate-y-0 transition-transform opacity-0 group-hover:opacity-100">
                        <p className="text-white text-xs font-medium line-clamp-1">{photo.note}</p>
                        <p className="text-white/60 text-xs">{format(new Date(photo.created_at), "dd MMM", { locale: fr })}</p>
                      </div>

                      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                        <button
                          onClick={e => { e.stopPropagation(); setSelected(photo); }}
                          className="w-7 h-7 bg-black/60 backdrop-blur-sm rounded-lg flex items-center justify-center"
                        >
                          <Eye className="w-3.5 h-3.5 text-white" />
                        </button>
                        <button
                          onClick={e => { e.stopPropagation(); setPhotos(prev => prev.filter(p => p.id !== photo.id)); toast.success("Photo supprimée"); }}
                          className="w-7 h-7 bg-red-500/70 backdrop-blur-sm rounded-lg flex items-center justify-center"
                        >
                          <X className="w-3.5 h-3.5 text-white" />
                        </button>
                      </div>

                      {isSelected && (
                        <div className="absolute top-2 left-2 w-6 h-6 rounded-full gradient-brand flex items-center justify-center">
                          <span className="text-white text-xs font-bold">
                            {comparePhotos[0]?.id === photo.id ? "1" : "2"}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="mt-2 px-0.5 flex items-center gap-1 text-xs text-muted-foreground">
                      <Calendar className="w-3 h-3" />
                      {format(new Date(photo.created_at), "dd MMM yyyy", { locale: fr })}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Lightbox */}
      {selected && (
        <div
          className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setSelected(null)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative max-w-sm w-full"
            onClick={e => e.stopPropagation()}
          >
            <button
              onClick={() => setSelected(null)}
              className="absolute -top-4 -right-4 w-8 h-8 bg-card border border-border rounded-full flex items-center justify-center z-10"
            >
              <X className="w-4 h-4" />
            </button>
            <img src={selected.image_url} alt="" className="w-full rounded-2xl" />
            {selected.note && (
              <div className="mt-3 text-center">
                <p className="text-sm font-medium">{selected.note}</p>
                <p className="text-xs text-muted-foreground mt-1">{format(new Date(selected.created_at), "dd MMMM yyyy", { locale: fr })}</p>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </div>
  );
}
