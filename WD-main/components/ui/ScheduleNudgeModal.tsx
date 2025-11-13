import React, { useState, useMemo } from 'react';
import { Modal } from './Modal';
import { Icon } from './Icon';
import { ScheduledNudge } from '../../types';

interface ScheduleNudgeModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSchedule: (details: { sendAt: Date; recurrence: ScheduledNudge['recurrence'] }) => void;
}

export const ScheduleNudgeModal: React.FC<ScheduleNudgeModalProps> = ({ isOpen, onClose, onSchedule }) => {
    const today = useMemo(() => {
        const d = new Date();
        d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
        return d.toISOString().split('T')[0];
    }, []);

    const [date, setDate] = useState(today);
    const [time, setTime] = useState('09:00');
    const [recurrence, setRecurrence] = useState<ScheduledNudge['recurrence']>('none');
    const [error, setError] = useState<string | null>(null);

    const handleConfirm = () => {
        const scheduledDateTime = new Date(`${date}T${time}`);
        if (isNaN(scheduledDateTime.getTime())) {
            setError('Please enter a valid date and time.');
            return;
        }
        if (scheduledDateTime < new Date()) {
            setError('Please select a time in the future.');
            return;
        }
        setError(null);
        onSchedule({ sendAt: scheduledDateTime, recurrence });
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Schedule Nudge">
            <div className="space-y-4">
                <p className="text-brand-text-secondary">Choose a date and time to send this Nudge. It can also be set to repeat.</p>
                
                {error && (
                    <div className="bg-red-100 text-red-800 p-3 rounded-lg text-sm border border-red-200">
                        {error}
                    </div>
                )}
                
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="schedule-date" className="block text-sm font-semibold text-brand-text-primary mb-1">Date</label>
                        <input
                            id="schedule-date"
                            type="date"
                            value={date}
                            min={today}
                            onChange={(e) => setDate(e.target.value)}
                            className="w-full p-2 bg-white border border-brand-secondary-300 rounded-md focus:border-brand-primary-300 focus:ring-1 focus:ring-brand-primary-300 transition-colors"
                        />
                    </div>
                    <div>
                        <label htmlFor="schedule-time" className="block text-sm font-semibold text-brand-text-primary mb-1">Time</label>
                        <input
                            id="schedule-time"
                            type="time"
                            value={time}
                            onChange={(e) => setTime(e.target.value)}
                            className="w-full p-2 bg-white border border-brand-secondary-300 rounded-md focus:border-brand-primary-300 focus:ring-1 focus:ring-brand-primary-300 transition-colors"
                        />
                    </div>
                </div>

                <div>
                    <label htmlFor="schedule-recurrence" className="block text-sm font-semibold text-brand-text-primary mb-1">Repeat</label>
                    <select
                        id="schedule-recurrence"
                        value={recurrence}
                        onChange={(e) => setRecurrence(e.target.value as ScheduledNudge['recurrence'])}
                        className="w-full p-2 bg-white border border-brand-secondary-300 rounded-md focus:border-brand-primary-300 focus:ring-1 focus:ring-brand-primary-300 transition-colors"
                    >
                        <option value="none">Does not repeat</option>
                        <option value="daily">Daily</option>
                        <option value="weekly">Weekly</option>
                        <option value="monthly">Monthly</option>
                    </select>
                </div>

                <div className="flex justify-end gap-3 pt-4">
                    <button onClick={onClose} className="px-4 py-2 text-sm font-semibold bg-brand-surface text-brand-text-secondary border border-brand-secondary-200 rounded-lg hover:bg-brand-secondary-100 interactive-scale">
                        Cancel
                    </button>
                    <button onClick={handleConfirm} className="px-4 py-2 text-sm font-semibold bg-brand-primary-500 text-white rounded-lg hover:bg-brand-primary-600 flex items-center gap-2 interactive-scale">
                        <Icon name="check" className="w-4 h-4" />
                        Confirm Schedule
                    </button>
                </div>
            </div>
        </Modal>
    );
};