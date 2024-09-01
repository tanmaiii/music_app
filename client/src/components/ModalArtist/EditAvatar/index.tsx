import React, { useEffect } from "react";
import "./style.scss";
import { useAuth } from "../../../context/AuthContext";
import { imageApi, userApi } from "../../../apis";
import { toast } from "sonner";
import { useMutation, useQueryClient } from "react-query";

const EditAvatar = ({
  open,
  closeModal,
}: {
  open?: boolean;
  closeModal: () => void;
}) => {
  const { currentUser, token } = useAuth();
  const InputRef = React.useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();

  const mutaionDelete = useMutation(
    async () => {
      try {
        currentUser?.image_path &&
          (await imageApi.delete(currentUser?.image_path, token));
        toast.success("Xóa ảnh đại diện thành công");
        await userApi.update(token, { image_path: "" });
        closeModal();
      } catch (error) {
        console.log(error);
      }
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["currentUser"]);
        queryClient.invalidateQueries(["artist", currentUser?.id]);
      },
    }
  );

  const onChangeImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]?.size > 1 * 1024 * 1024) {
      toast.error("Kích thước ảnh phải nhỏ hơn 1MB");
      return;
    }
    if (e.target.files && e.target.files[0]) {
      mutaion.mutate(e.target.files[0]);
    }
  };

  const mutaion = useMutation(
    async (file: File) => {
      try {
        const formDataImage = new FormData();
        file && formDataImage.append("image", file);

        try {
          if (currentUser?.image_path) {
            await imageApi.delete(currentUser?.image_path, token);
          }
        } catch (error) {
          console.log(error);
        }

        const res = await imageApi.upload(formDataImage, token);
        res.image && (await userApi.update(token, { image_path: res.image }));
        toast.success("Cập nhật ảnh đại diện thành công");
        closeModal();
      } catch (error) {
        console.log(error);
      }
    },
    {
      onSuccess: () => {
        queryClient.refetchQueries(["currentUser"]);
        queryClient.refetchQueries(["artist", currentUser?.id]);
      },
    }
  );

  useEffect(() => {
    if (open) {
      InputRef.current?.value && (InputRef.current.value = "");
    }
  }, [open]);

  return (
    <div className="Modal__edit__avatar">
      <div>
        <h3>Đổi ảnh đại diện</h3>
      </div>
      {(currentUser?.image_path?.length ?? 0) > 0 && (
        <button className="btn-delete" onClick={() => mutaionDelete.mutate()}>
          <h4>Gỡ ảnh hiện tại</h4>
        </button>
      )}
      <label htmlFor="input-image-avatar" className="btn-submit">
        <h4>Tải ảnh lên</h4>
        <input
          ref={InputRef}
          type="file"
          id="input-image-avatar"
          onChange={onChangeImage}
          accept="image/png, image/jpeg"
        />
      </label>
      <button className="btn-cancel" onClick={() => closeModal()}>
        <h4>Hủy</h4>
      </button>
    </div>
  );
};

export default EditAvatar;
