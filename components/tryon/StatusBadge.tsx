import React from "react";
import { View, Text } from "react-native";
import type { TryOnTask } from "@/hooks/useTryOnStore";

export default function StatusBadge({ status }: { status: TryOnTask["status"] }) {
	const map: Record<TryOnTask["status"], { bg: string; color: string; text: string }> = {
		queued:   { bg: "#E5E7EB", color: "#374151", text: "In queue" },
		running:  { bg: "#DBEAFE", color: "#1E3A8A", text: "Work in progress" },
		completed:{ bg: "#DCFCE7", color: "#166534", text: "Ready" },
		failed:   { bg: "#FEE2E2", color: "#991B1B", text: "Error" },
	};
	const s = map[status];
	return (
		<View style={{ backgroundColor: s.bg, paddingVertical: 4, paddingHorizontal: 8, borderRadius: 999 }}>
			<Text style={{ color: s.color, fontWeight: "700", fontSize: 12 }}>{s.text}</Text>
		</View>
	);
}
