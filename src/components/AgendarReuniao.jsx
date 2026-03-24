import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Calendar, Clock, Mail, AlertCircle, Check } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

export default function AgendarReuniao({ isOpen, onClose, mentorado }) {
  const [titulo, setTitulo] = useState('Reunião de Mentoria');
  const [data, setData] = useState('');
  const [horaInicio, setHoraInicio] = useState('14:00');
  const [horaFim, setHoraFim] = useState('15:00');
  const [descricao, setDescricao] = useState('');
  const [incluirLink, setIncluirLink] = useState(false);
  const [carregando, setCarregando] = useState(false);

  const handleAgendar = async () => {
    if (!data || !horaInicio || !horaFim) {
      toast.error('Preencha data e horários');
      return;
    }

    if (new Date(`${data}T${horaFim}`) <= new Date(`${data}T${horaInicio}`)) {
      toast.error('Horário de fim deve ser após o de início');
      return;
    }

    setCarregando(true);
    try {
      const dataInicio = new Date(`${data}T${horaInicio}`);
      const dataFim = new Date(`${data}T${horaFim}`);

      const response = await base44.functions.invoke('scheduleCalendarMeeting', {
        mentoradoNome: mentorado.nome,
        mentoradoEmail: mentorado.email,
        titulo,
        dataInicio: dataInicio.toISOString(),
        dataFim: dataFim.toISOString(),
        descricao,
        link: incluirLink,
      });

      if (response.data.success) {
        toast.success('Reunião agendada no Google Calendar!');
        onClose();
        setTitulo('Reunião de Mentoria');
        setData('');
        setHoraInicio('14:00');
        setHoraFim('15:00');
        setDescricao('');
        setIncluirLink(false);
      } else {
        toast.error(response.data.error || 'Erro ao agendar');
      }
    } catch (error) {
      toast.error(error.message || 'Erro ao agendar reunião');
    } finally {
      setCarregando(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] bg-[#0d0d14] border-white/10">
        <DialogHeader>
          <DialogTitle className="text-white">Agendar Reunião</DialogTitle>
          <DialogDescription className="text-white/60">
            Agende uma reunião com {mentorado?.nome} no Google Calendar
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Email do mentorado */}
          <div className="flex items-center gap-2 p-3 bg-white/5 rounded-lg border border-white/10">
            <Mail size={16} className="text-[#7c6bff]" />
            <span className="text-sm text-white/80">{mentorado?.email}</span>
          </div>

          {/* Título */}
          <div>
            <label className="text-xs font-medium text-white/60 mb-1 block">Título da Reunião</label>
            <Input
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              placeholder="Ex: Reunião de Mentoria"
              className="bg-white/5 border-white/10 text-white placeholder:text-white/30"
            />
          </div>

          {/* Data */}
          <div>
            <label className="text-xs font-medium text-white/60 mb-1 block">Data</label>
            <div className="flex items-center gap-2">
              <Calendar size={16} className="text-white/40" />
              <Input
                type="date"
                value={data}
                onChange={(e) => setData(e.target.value)}
                className="bg-white/5 border-white/10 text-white"
              />
            </div>
          </div>

          {/* Horários */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-white/60 mb-1 block">Início</label>
              <div className="flex items-center gap-2">
                <Clock size={16} className="text-white/40" />
                <Input
                  type="time"
                  value={horaInicio}
                  onChange={(e) => setHoraInicio(e.target.value)}
                  className="bg-white/5 border-white/10 text-white"
                />
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-white/60 mb-1 block">Fim</label>
              <Input
                type="time"
                value={horaFim}
                onChange={(e) => setHoraFim(e.target.value)}
                className="bg-white/5 border-white/10 text-white"
              />
            </div>
          </div>

          {/* Descrição */}
          <div>
            <label className="text-xs font-medium text-white/60 mb-1 block">Descrição (Opcional)</label>
            <Textarea
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              placeholder="Detalhes adicionais sobre a reunião..."
              className="bg-white/5 border-white/10 text-white placeholder:text-white/30 min-h-[80px]"
            />
          </div>

          {/* Incluir link de conferência */}
          <div className="flex items-center gap-2 p-3 bg-white/5 rounded-lg border border-white/10 cursor-pointer hover:bg-white/8 transition-colors"
            onClick={() => setIncluirLink(!incluirLink)}>
            <input
              type="checkbox"
              checked={incluirLink}
              onChange={(e) => setIncluirLink(e.target.checked)}
              className="w-4 h-4 rounded bg-white/10 border-white/20"
            />
            <span className="text-sm text-white/80">Incluir link Google Meet</span>
          </div>

          {/* Info */}
          <div className="flex gap-2 p-3 bg-blue-500/10 rounded-lg border border-blue-500/20">
            <AlertCircle size={16} className="text-blue-400 flex-shrink-0 mt-0.5" />
            <span className="text-xs text-blue-300">Um convite será enviado para o email do mentorado</span>
          </div>
        </div>

        <div className="flex gap-2 justify-end">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={carregando}
            className="text-white border-white/20 hover:bg-white/10"
          >
            Cancelar
          </Button>
          <Button
            onClick={handleAgendar}
            disabled={carregando || !data}
            className="bg-[#FF4D00] text-white hover:bg-[#E64500]"
          >
            {carregando ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                Agendando...
              </>
            ) : (
              <>
                <Check size={16} className="mr-2" />
                Agendar Reunião
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}