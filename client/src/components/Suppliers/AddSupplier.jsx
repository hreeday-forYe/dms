import { useNavigate } from "react-router-dom";
import {
  useAddSupplierMutation,
  useGetAllSupplierQuery,
} from "@/app/slices/supplierApiSlice";
import SupplierForm from "./SupplierForm ";
import { toast } from "react-toastify";
import { useState } from "react";

function AddSupplier() {
  const navigate = useNavigate();
  const [addSupplier, { isLoading }] = useAddSupplierMutation();
  const [selectedImage, setSelectedImage] = useState("");
  const { refetch } = useGetAllSupplierQuery();

  const handleSubmit = async (data) => {
    try {
      const response = await addSupplier({
        ...data,
        avatar: selectedImage,
      }).unwrap();
      if (response.success) {
        refetch();
        toast.success("Supplier Added Successfully");
        navigate("/admin/suppliers");
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!["image/jpeg", "image/png", "image/gif"].includes(file.type)) {
        toast.error("Please upload only JPG, PNG or GIF images");
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error("File size should be less than 5MB");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <SupplierForm
      onSubmit={handleSubmit}
      onCancel={() => navigate(-1)}
      isLoading={isLoading}
      selectedImage={selectedImage}
      onImageChange={handleImageChange}
    />
  );
}

export default AddSupplier;
