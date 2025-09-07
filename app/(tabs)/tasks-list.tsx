import React, { useCallback, useMemo, useRef } from "react";
import { View, Text, Pressable, StyleSheet, Alert } from "react-native";
import { useFocusEffect } from "expo-router";
import TaskItem from "@/components/tryon/TaskItem";
import { useTryOnStore, TryOnTask } from "@/hooks/useTryOnStore";
import { createTask, getTask } from '@/api';
import SaveLooksGate from '@/components/SaveLooksGate';
import { Container } from '@/components/ui/Container';
import { useTranslation } from "react-i18next";

export default function TryOnQueueScreen() {
	const { t } = useTranslation();
	
	const {
		tasks, updateTask, removeTask, clearFinished, resetInputs
	} = useTryOnStore();
	
	const intervalRef = useRef<any>(null);
	
	// Auto-poll active tasks
	useFocusEffect(
		useCallback(() => {
			startPolling();
			return stopPolling;
			// eslint-disable-next-line react-hooks/exhaustive-deps
		}, [tasks])
	);
	
	function startPolling() {
		stopPolling();
		intervalRef.current = setInterval(() => {
			pollActive().catch(() => {});
		}, 3000);
	}
	function stopPolling() {
		if (intervalRef.current) clearInterval(intervalRef.current);
		intervalRef.current = null;
	}
	
	async function pollActive() {
		const active = tasks.filter((t) => t.status === "queued" || t.status === "running");
		if (active.length === 0) return;
		
		await Promise.all(
			active.map(async (task) => {
				try {
					const j = await getTask(task.id);
					const status: string = j?.data?.status || "queued";
					
					if (status === "completed") {
						const works = j?.data?.output?.works ?? [];
						const url =
							works[0]?.cover?.resource ||
							works[0]?.image?.resource ||
							j?.data?.output?.resource ||
							null;
						
						updateTask(task.id, { status: "completed", resultUrl: url });
						
						// clear inputs after first success
						resetInputs();
						return;
					}
					
					if (status === "failed" || j?.data?.error?.code) {
						const msg = j?.data?.error?.message || t("task.resultNotFound");
						updateTask(task.id, { status: "failed", error: msg });
						return;
					}
					
					updateTask(task.id, { status: status === "running" ? "running" : "queued" });
				} catch {
					// ignore transient errors
				}
			})
		);
	}
	
	async function retryTask(task: TryOnTask) {
		try {
			const { id: newId } = await createTask(task.payload);
			updateTask(task.id, { id: newId, status: "queued", error: null, resultUrl: null });
		} catch (e: any) {
			Alert.alert(t("common.error"), e?.message || t("task.retryFailed", "Retry failed"));
		}
	}
	
	const empty = useMemo(
		() => (
			<View style={{ alignItems: "center", marginTop: 24 }}>
				<Text style={{ color: "#6B7280", textAlign: "center" }}>
					{t("queue.empty")}
				</Text>
			</View>
		),
		[t]
	);
	
	return (
		<Container.WithScrollBar title={t("queue.title")}>
			<SaveLooksGate style={{ marginBottom: 12 }} />
			
			<View style={s.actions}>
				<Pressable style={s.btnLight} onPress={clearFinished}>
					<Text style={s.btnLightText}>{t("queue.clearFinished")}</Text>
				</Pressable>
			</View>
			
			{!tasks.length && empty}
			{tasks.map((item) => (
					<TaskItem
						key={item.id}
						task={item}
						onRetry={retryTask}
						onRemove={removeTask}
					/>
				))}
		</Container.WithScrollBar>
	);
}


const s = StyleSheet.create({
	title: { fontSize: 22, fontWeight: "800", marginBottom: 8 },
	actions: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 8 },
	btn: { flexGrow: 1, backgroundColor: "#111827", paddingVertical: 12, borderRadius: 12, alignItems: "center" },
	btnDisabled: { opacity: 0.6 },
	btnText: { color: "#fff", fontWeight: "700" },
	btnLight: { paddingVertical: 12, paddingHorizontal: 12, borderRadius: 12, backgroundColor: "#E5E7EB" },
	btnLightText: { color: "#111827", fontWeight: "700" },
});
