import { create } from 'zustand';
import { storage } from '@/utils';          // sync get/set/delete
import { fetchSelfUser } from '@/api/user.api'; // GET /users/self
import { User } from '@/types';
import { useWardrobeStore } from '@/hooks/useWardrobeStore';

type Status = 'idle' | 'loading' | 'ready';

type UserStore = {
	status: Status;          // когда status === 'ready' — init завершён
	user: User | null;
	error: string | null;
	
	init: () => Promise<void>;
	setUser: (u: User | null) => void;
	dropUser: () => void;    // logout: очищает storage и user
};

export const useUserStore = create<UserStore>((set, get) => ({
	status: 'idle',
	user: null,
	error: null,
	
	setUser: (user) => {
		if (user?.token) {
			storage.set?.('token', user.token);
		}

		set({ user, error: null })
	},
	
	dropUser: () => {
		storage.delete?.('token');
		
		set({ user: null, error: null, status: 'ready' });
		
		useWardrobeStore.getState().clear();
	},
	
	init: async () => {
		if (get().status === 'loading') return;
		
		set({ status: 'loading', error: null });
		
		try {
			const token = await storage.get?.('token') as string | null;

			if (!token) {
				set({ user: null, status: 'ready' });
				return;
			}

			const me = await fetchSelfUser();
	
			set({ user: me, status: 'ready' });
		} catch (e: any) {
			if (e?.status === 401 || e?.response?.status === 401) {
				storage.delete?.('token');
			}
			set({ user: null, status: 'ready', error: e?.message ?? 'Auth failed' });
		}
	},
}));
