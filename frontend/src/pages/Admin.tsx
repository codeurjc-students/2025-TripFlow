import { useState } from "react";

import { getUserColumns } from "@/components/dashboard/admin/userColumns";
import { useUsers } from "@/hooks/useUsers";

import AppLayout from "@/layouts/AppLayout";
import AdminHeader from "@components/dashboard/headers/AdminHeader";
import UsersByPlanChart from "@/components/dashboard/admin/UsersByPlanChart";
import Searchbar from "@components/shared/Searchbar";
import Table from "@components/shared/Table";
import Pagination from "@components/shared/Pagination";
import Modal from "@components/shared/Modal";
import Loader from "@/components/shared/Loader";

export default function AdminPage() {
    const [search, setSearch] = useState("");
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [userToDelete, setUserToDelete] = useState<string | null>(null);

    const {
        users, isLoading, pageData, handleSearch,
        handlePageChange, removeUser
    } = useUsers();

    const initiationDelete = (username: string) => {
        setUserToDelete(username);
        setDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        if (!userToDelete) return;

        const success = await removeUser(userToDelete);
        
        if (success) {
            setDeleteModalOpen(false);
            setUserToDelete(null);
        }
    };

    const columns = getUserColumns(initiationDelete);

    return (
        <AppLayout admin>
            <AdminHeader>
                <Searchbar
                    placeHolder="Buscar por nombre de usuario..."
                    onInputChange={(value) => setSearch(value)}
                    onSearch={() => handleSearch(search)}
                />
            </AdminHeader>

            <UsersByPlanChart />

            {isLoading ? (
                <Loader variant="dots" />
            ) : (
                <Table
                    data={users}
                    columns={columns}
                    emptyMessage="No se encontraron usuarios"
                    isLoading={isLoading}
                />
            )}

            {!isLoading && (
                <Pagination
                    pageData={pageData}
                    onPageChange={handlePageChange}
                />
            )}

            <Modal
                isOpen={deleteModalOpen}
                title="Eliminar Usuario"
                message={`¿Estás seguro de que quieres eliminar al usuario @${userToDelete}? Esta acción no se puede deshacer.`}
                confirmText="Eliminar"
                cancelText="Cancelar"
                onConfirm={confirmDelete}
                onCancel={() => setDeleteModalOpen(false)}
                variant="danger"
            />
        </AppLayout>
    );
}
