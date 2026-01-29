import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { User, Mail, Building2, Phone, MapPin, Save, Key, AlertCircle } from "lucide-react";
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
              <Label className="text-white/80">Nome Completo</Label>
              <div className="mt-1 text-white font-medium">{userData?.full_name || "..."}</div>
            </div>
            <div>
              <Label className="text-white/80">Email</Label>
              <div className="mt-1 text-white font-medium flex items-center gap-2">
                <Mail size={16} />
                {userData?.email || "..."}
              </div>
            </div>
            <div>
              <Label className="text-white/80">Função</Label>
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
              <Label htmlFor="nome" className="text-white/80">Nome Completo</Label>
              <Input
                id="nome"
                value={formData.nome}
                onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                className="bg-white/10 border-white/20 text-white"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="negocio" className="text-white/80">Nome do Negócio</Label>
              <Input
                id="negocio"
                value={formData.negocio}
                onChange={(e) => setFormData({ ...formData, negocio: e.target.value })}
                className="bg-white/10 border-white/20 text-white"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cidade" className="text-white/80">Cidade</Label>
              <Input
                id="cidade"
                value={formData.cidade}
                onChange={(e) => setFormData({ ...formData, cidade: e.target.value })}
                className="bg-white/10 border-white/20 text-white"
                placeholder="Ex: São Paulo - SP"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contato" className="text-white/80">WhatsApp / Telefone</Label>
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