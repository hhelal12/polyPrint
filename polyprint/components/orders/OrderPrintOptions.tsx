interface FormData {
    service_type: string;
    quantity: number;
    paper_size: string;
    color_mode: string;
    print_sides: string;
}

interface Props {
    formData: FormData;
    onChange: (updated: Partial<FormData>) => void;
    fieldClass: string;
}

export default function OrderPrintOptions({ formData, onChange, fieldClass }: Props) {
    return (
        <div className="space-y-4">
            {/* ── Service Type + Quantity ── */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                        Service Type
                    </label>
                    <select
                        className={fieldClass}
                        value={formData.service_type}
                        onChange={(e) => onChange({ service_type: e.target.value })}
                    >
                        <option value="Printing">Printing</option>
                        <option value="Scanning">Scanning</option>
                        <option value="Binding">Printing posters</option>
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                        Quantity (Copies)
                    </label>
                    <input
                        type="number"
                        min="1"
                        required
                        className={fieldClass}
                        value={isNaN(formData.quantity) ? "" : formData.quantity}
                        onChange={(e) => onChange({ quantity: parseInt(e.target.value) || 1 })}
                    />
                </div>
            </div>

            {/* ── Paper Size / Color / Sides ── */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                        Paper Size
                    </label>
                    <select
                        className={fieldClass}
                        value={formData.paper_size}
                        onChange={(e) => onChange({ paper_size: e.target.value })}
                    >
                        <option value="A4">A4</option>
                        <option value="A3">A3</option>
                        <option value="A2">A2</option>
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                        Color Mode
                    </label>
                    <select
                        className={fieldClass}
                        value={formData.color_mode}
                        onChange={(e) => onChange({ color_mode: e.target.value })}
                    >
                        <option value="black_and_white">Black & White</option>
                        <option value="color">Full Color</option>
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                        Sides
                    </label>
                    <select
                        className={fieldClass}
                        value={formData.print_sides}
                        onChange={(e) => onChange({ print_sides: e.target.value })}
                    >
                        <option value="One-sided">One-sided</option>
                        <option value="Double-sided">Double-sided</option>
                    </select>
                </div>
            </div>
        </div>
    );
}