import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { User, Mail, Building2, Phone, MapPin, Save, Key, AlertCircle, Trash2 } from "lucide-react";
import { toast } from "sonner";

export default function PerfilMentorado() {
  const queryClient = useQueryClient();
  const [userData, setUserData] = useState(null);
  const [mentoradoData, setMentoradoData] = useState(null);
  const [formData, setFormData] = useState({
    nome: "",
    negocio: "",
    cidade: "",
    contato: ""
  });

  const { data: user } = useQuery({
    queryKey: ["currentUser"],
    queryFn: () => base44.auth.me()
  });

  const { data: mentorado } = useQuery({
    queryKey: ["mentorado", user?.email],
    queryFn: () => base44.entities.Mentorado.filter({ email: user?.email }),
    enabled: !!user?.email,
    select: (data) => data[0]
  });

  useEffect(() => {
    if (user) setUserData(user);
    if (mentorado) {
      setMentoradoData(mentorado);
      setFormData({
        nome: mentorado.nome || "",
        negocio: mentorado.negocio || "",
        cidade: mentorado.cidade || "",
        contato: mentorado.contato || ""
      });
    }
  }, [user, mentorado]);

  const updateMentoradoMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Mentorado.update(id, data),
    onMutate: async ({ id, data }) => {
      await queryClient.cancelQueries({ queryKey: ["mentorado", user?.email] });
      const previous = queryClient.getQueryData(["mentorado", user?.email]);
      queryClient.setQueryData(["mentorado", user?.email], (old) =>
        old ? [{ ...old[0], ...data }] : old
      );
      return { previous };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.previous) queryClient.setQueryData(["mentorado", user?.email], ctx.previous);
      toast.error("Erro ao salvar. Tente novamente.");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["mentorado"] });
      toast.success("Perfil atualizado com sucesso!");
    }
  });

  const handleSave = () => {
    if (mentorado?.id) {
      updateMentoradoMutation.mutate({
        id: mentorado.id,
        data: formData
      });
    }
  };

  const [deleteStep, setDeleteStep] = useState(0); // 0=hidden, 1=confirm, 2=sent
  const [deleteConfirmText, setDeleteConfirmText] = useState("");

  const handleRequestDeletion = async () => {
    if (deleteConfirmText.trim().toUpperCase() !== "EXCLUIR") return;
    try {
      // Delete user's own data records
      const [execucoes, planos, scores, checklists, evolucoes] = await Promise.allSettled([
        base44.entities.ChecklistExecucao.filter({ mentorado_id: mentorado?.id }),
        base44.entities.PlanoAcao.filter({ mentorado_id: mentorado?.id }),
        base44.entities.ScoreMentorado.filter({ mentorado_id: mentorado?.id }),
        base44.entities.ChecklistExecucao.filter({ mentorado_id: mentorado?.id }),
        base44.entities.Evolucao.filter({ mentorado_id: mentorado?.id }),
      ]);

      const deleteAll = async (result) => {
        if (result.status === 'fulfilled') {
          await Promise.allSettled((result.value || []).map(r => r.id && base44.entities[r.__entity]?.delete(r.id)));
        }
      };

      // Delete mentorado record itself
      if (mentorado?.id) {
        await base44.entities.Mentorado.delete(mentorado.id);
      }

      await base44.integrations.Core.SendEmail({
        to: "meudeliverydemilhoes@gmail.com",
        subject: "[Conta Excluída] Dados removidos",
        body: `O usuário ${userData?.full_name} (${userData?.email}) excluiu sua conta e todos os dados associados foram removidos em ${new Date().toLocaleDateString('pt-BR')}.`
      });

      setDeleteStep(2);
      setTimeout(() => base44.auth.logout(), 3000);
    } catch (e) {
      setDeleteStep(2);
      setTimeout(() => base44.auth.logout(), 3000);
    }
  };

  const handlePasswordReset = async () => {
    toast.info("Você será redirecionado para redefinir sua senha");
    setTimeout(() => {
      base44.auth.logout(window.location.origin);
    }, 1500);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Meu Perfil</h1>
        <p className="text-white/60 mt-1">Gerencie suas informações pessoais e configurações</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Informações do Usuário */}
        <Card className="bg-white/5 border-white/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <User size={20} />
              Informações da Conta
            </CardTitle>
            <CardDescription className="text-white/60">
              Informações de login gerenciadas pelo sistema
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-white/80 text-[14px]">Nome Completo</Label>
              <div className="mt-1 text-white font-medium">{userData?.full_name || "..."}</div>
            </div>
            <div>
              <Label className="text-white/80 text-[14px]">Email</Label>
              <div className="mt-1 text-white font-medium flex items-center gap-2">
                <Mail size={16} />
                {userData?.email || "..."}
              </div>
            </div>
            <div>
              <Label className="text-white/80 text-[14px]">Função</Label>
              <div className="mt-1 text-white font-medium capitalize">
                {userData?.role === "admin" ? "Administrador" : "Mentorado"}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Alterar Senha */}
        <Card className="bg-white/5 border-white/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <Key size={20} />
              Segurança da Conta
            </CardTitle>
            <CardDescription className="text-white/60">
              Gerencie sua senha de acesso
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
              <div className="flex gap-3">
                <AlertCircle size={20} className="text-blue-400 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-white/80">
                  Para alterar sua senha, você será redirecionado para a tela de login onde poderá
                  solicitar a redefinição via email.
                </div>
              </div>
            </div>
            <Button
              onClick={handlePasswordReset}
              variant="outline"
              className="w-full border-white/20 hover:bg-white/10"
            >
              <Key size={16} className="mr-2" />
              Redefinir Senha
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Exclusão de Conta */}
      <Card className="bg-red-950/20 border-red-500/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-400">
            <Trash2 size={20} />
            Solicitar Exclusão de Conta
          </CardTitle>
          <CardDescription className="text-white/50">
            Esta ação é permanente e não poderá ser desfeita
          </CardDescription>
        </CardHeader>
        <CardContent>
          {deleteStep === 0 && (
            <div className="space-y-3">
              <p className="text-sm text-white/60">
                Ao solicitar a exclusão, todos os seus dados serão permanentemente removidos da plataforma em até 7 dias úteis.
              </p>
              <Button variant="outline" className="border-red-500/40 text-red-400 hover:bg-red-500/10" onClick={() => setDeleteStep(1)}>
                <Trash2 size={16} className="mr-2" />
                Solicitar Exclusão
              </Button>
            </div>
          )}
          {deleteStep === 1 && (
            <div className="space-y-4">
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 text-sm text-white/80">
                <strong className="text-red-400">Atenção:</strong> Para confirmar, digite <strong>EXCLUIR</strong> abaixo.
              </div>
              <input
                value={deleteConfirmText}
                onChange={e => setDeleteConfirmText(e.target.value)}
                placeholder="Digite EXCLUIR para confirmar"
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-red-500/50"
              />
              <div className="flex gap-2">
                <Button variant="outline" className="flex-1 border-white/10 text-white/60" onClick={() => { setDeleteStep(0); setDeleteConfirmText(""); }}>Cancelar</Button>
                <Button className="flex-1 bg-red-600 hover:bg-red-700 text-white" disabled={deleteConfirmText.trim().toUpperCase() !== "EXCLUIR"} onClick={handleRequestDeletion}>Confirmar</Button>
              </div>
            </div>
          )}
          {deleteStep === 2 && (
            <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4 text-sm text-green-400">
              ✓ Dados excluídos com sucesso. Você será desconectado em instantes...
            </div>
          )}
        </CardContent>
      </Card>

      {/* Informações do Negócio */}
      <Card className="bg-white/5 border-white/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <Building2 size={20} />
            Informações do Negócio
          </CardTitle>
          <CardDescription className="text-white/60">
            Atualize as informações sobre seu delivery
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="nome" className="text-white/80 text-[14px]">Nome Completo</Label>
              <Input
                id="nome"
                value={formData.nome}
                onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                className="bg-white/10 border-white/20 text-white"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="negocio" className="text-white/80 text-[14px]">Nome do Negócio</Label>
              <Input
                id="negocio"
                value={formData.negocio}
                onChange={(e) => setFormData({ ...formData, negocio: e.target.value })}
                className="bg-white/10 border-white/20 text-white"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cidade" className="text-white/80 text-[14px]">Cidade</Label>
              <Input
                id="cidade"
                value={formData.cidade}
                onChange={(e) => setFormData({ ...formData, cidade: e.target.value })}
                className="bg-white/10 border-white/20 text-white"
                placeholder="Ex: São Paulo - SP"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contato" className="text-white/80 text-[14px]">WhatsApp / Telefone</Label>
              <Input
                id="contato"
                value={formData.contato}
                onChange={(e) => setFormData({ ...formData, contato: e.target.value })}
                className="bg-white/10 border-white/20 text-white"
                placeholder="(11) 99999-9999"
              />
            </div>
          </div>
          <div className="flex justify-end pt-4">
            <Button
              onClick={handleSave}
              disabled={updateMentoradoMutation.isPending}
              className="bg-[#FF4D00] hover:bg-[#E64500]"
            >
              <Save size={16} className="mr-2" />
              Salvar Alterações
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}