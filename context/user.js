import { Router } from 'next/router';
import { createContext, useState, useEffect, useContext } from 'react'
import { supabase } from "../utils/supabase";
import { useRouter } from "next/router";
import axios from "axios";

const Context = createContext();

const Provider = ({children}) => {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(true);
    const [user, setUser] = useState(supabase.auth.user());

    useEffect(() => {
        const getUserProfile = async() => {
            const sessionUser = supabase.auth.user()

            if (sessionUser) {
                const {data: profile} = await supabase
                .from('profile')
                .select('*')
                .eq('id', sessionUser.id)
                .single()
            

                setUser({
                    ...sessionUser,
                    ...profile,
                });

                setIsLoading(false);
            }

            
        }
        // Call get user profile when component mounts
        getUserProfile();

        //Or whenever auth state changes
        supabase.auth.onAuthStateChange(() => {
            getUserProfile();
        })
    }, []);

    useEffect(() => {
        axios.post('/api/set-supabase-cookie', {
            event: user ? 'SIGNED_IN' : 'SIGNED_OUT',
            session: supabase.auth.session(),
        })
    }, [user])

    useEffect(() => {
        if (user) {
            const subscription = supabase
            .from(`profile:id=eq.${user.id}`)
            .on('UPDATE', (payload) => {
                setUser({...user, ...payload.new})
            })
            .subscribe()

            return () => {
                supabase.removeSubscription()
            }
        }
    }, [user])

    const login = async () => {
        await supabase.auth.signIn({
            provider: "github",
        })
    };

    const logout = async () => {
        await supabase.auth.signOut();
        setUser(null);
        router.push('/');
    }

    const exposed = {
        user,
        login,
        logout,
        isLoading,
    }

    return <Context.Provider value={exposed}>{children}</Context.Provider>

};

export const useUser = () => useContext(Context);

export default Provider;